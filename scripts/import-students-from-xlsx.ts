import 'dotenv/config';
import path from 'path';
import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';
import pg from 'pg';
import {
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '../src/infrastructure/auth/cognito/client';
import { cognitoConfig } from '../src/infrastructure/auth/cognito/config';
import { getDatabaseConfig, getDatabaseDialectOptions } from '../src/infrastructure/database/config/database.config';
import {
  parseStudentSpreadsheetRow,
  type StudentSpreadsheetRow,
} from '../src/application/import/parse-student-spreadsheet-row';

type ImportStats = {
  rows: number;
  parsed: number;
  createdCognito: number;
  createdDb: number;
  updatedDb: number;
  skipped: number;
  errors: number;
};

async function findCognitoSubByEmail(email: string): Promise<string | null> {
  try {
    const res = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: email,
      })
    );
    const sub = res.UserAttributes?.find((a) => a.Name === 'sub')?.Value;
    return sub ?? null;
  } catch {
    return null;
  }
}

async function createCognitoStudent(row: StudentSpreadsheetRow): Promise<string> {
  const poolId = cognitoConfig.userPoolId;
  if (!poolId) {
    throw new Error('COGNITO_USER_POOL_ID não configurado.');
  }

  try {
    const created = await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: poolId,
        Username: row.email,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          { Name: 'email', Value: row.email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: row.fullName },
          { Name: 'custom:typeUser', Value: 'student' },
        ],
      })
    );
    const sub = created.User?.Attributes?.find((a) => a.Name === 'sub')?.Value;
    if (!sub) {
      throw new Error(`Cognito não retornou sub para ${row.email}`);
    }
    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: poolId,
        Username: row.email,
        Password: row.password,
        Permanent: true,
      })
    );
    return sub;
  } catch (err) {
    if ((err as { name?: string }).name === 'UsernameExistsException') {
      const existing = await findCognitoSubByEmail(row.email);
      if (!existing) throw err;
      return existing;
    }
    throw err;
  }
}

async function findStudentIdByEmail(client: pg.Client, email: string): Promise<string | null> {
  const { rows } = await client.query<{ id: string }>(
    'SELECT id FROM students WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1',
    [email]
  );
  return rows[0]?.id ?? null;
}

async function insertStudent(
  client: pg.Client,
  id: string,
  row: StudentSpreadsheetRow
): Promise<void> {
  await client.query(
    `INSERT INTO students (
      id, trainer_id, full_name, email, phone, birth, cpf,
      type_plan, height, weight, validation, validation_plan,
      in_revalution, was_exclusive, refresh_token, expo_push_token, check_winner, photo_perfil
    ) VALUES (
      $1, $2, $3, $4, $5, NULL, NULL,
      $6, NULL, NULL, $7, $8,
      false, $9, NULL, NULL, NULL, NULL
    )`,
    [
      id,
      row.trainerId,
      row.fullName,
      row.email,
      row.phone,
      row.typePlan,
      row.validation,
      row.validationPlan,
      row.wasExclusive,
    ]
  );
}

async function updateStudentPlan(
  client: pg.Client,
  id: string,
  row: StudentSpreadsheetRow
): Promise<void> {
  await client.query(
    `UPDATE students SET
      full_name = $2,
      phone = COALESCE($3, phone),
      type_plan = $4,
      validation = $5,
      validation_plan = $6,
      was_exclusive = CASE WHEN $7 THEN true ELSE was_exclusive END,
      trainer_id = $8
    WHERE id = $1`,
    [
      id,
      row.fullName,
      row.phone,
      row.typePlan,
      row.validation,
      row.validationPlan,
      row.wasExclusive,
      row.trainerId,
    ]
  );
}

function loadRows(xlsxPath: string): unknown[][] {
  const buffer = readFileSync(xlsxPath);
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null }) as unknown[][];
  return raw.slice(1);
}

async function main(): Promise<void> {
  const apply = process.env.IMPORT_APPLY === '1';
  const xlsxPath =
    process.env.IMPORT_XLSX_PATH?.trim() ||
    path.join(process.cwd(), 'alunas', 'alunas.xlsx');

  const cfg = getDatabaseConfig();
  const dialectOptions = getDatabaseDialectOptions();
  const client = new pg.Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.username,
    password: cfg.password,
    database: cfg.database,
    ssl: dialectOptions?.ssl,
  });

  const stats: ImportStats = {
    rows: 0,
    parsed: 0,
    createdCognito: 0,
    createdDb: 0,
    updatedDb: 0,
    skipped: 0,
    errors: 0,
  };

  const sheetRows = loadRows(xlsxPath);
  stats.rows = sheetRows.length;

  await client.connect();

  try {
    for (const cells of sheetRows) {
      const row = parseStudentSpreadsheetRow(cells);
      if (!row) {
        stats.skipped += 1;
        continue;
      }
      stats.parsed += 1;

      if (!apply) {
        console.log(
          JSON.stringify({
            dryRun: true,
            email: row.email,
            validation: row.validation,
            validation_plan: row.validationPlan,
            type_plan: row.typePlan,
          })
        );
        continue;
      }

      try {
        const trainerCheck = await client.query('SELECT id FROM trainers WHERE id = $1', [
          row.trainerId,
        ]);
        if (trainerCheck.rowCount === 0) {
          throw new Error(`Treinadora ${row.trainerId} não encontrada.`);
        }

        let studentId = await findStudentIdByEmail(client, row.email);
        const cognitoExisted = (await findCognitoSubByEmail(row.email)) !== null;
        const sub = studentId ?? (await createCognitoStudent(row));
        if (!cognitoExisted && !studentId) {
          stats.createdCognito += 1;
        }

        if (!studentId) {
          await insertStudent(client, sub, row);
          stats.createdDb += 1;
        } else {
          await updateStudentPlan(client, studentId, row);
          stats.updatedDb += 1;
        }
      } catch (err) {
        stats.errors += 1;
        console.error(
          JSON.stringify({
            email: row.email,
            error: err instanceof Error ? err.message : String(err),
          })
        );
      }
    }
  } finally {
    await client.end();
  }

  console.log(
    JSON.stringify({
      apply,
      environment: process.env.ENVIRONMENT ?? 'local',
      database: cfg.database,
      xlsxPath,
      ...stats,
    })
  );

  if (!apply) {
    console.log('Nenhuma alteração. Defina IMPORT_APPLY=1 para importar.');
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});