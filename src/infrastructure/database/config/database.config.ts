export type DatabaseConnectionConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: 'postgres';
};

function useLocalDatabase(): boolean {
  const env = (process.env.ENVIRONMENT ?? 'local').toLowerCase();
  return env === 'local' || env === 'development';
}

export function getDatabaseConfig(): DatabaseConnectionConfig {
  if (useLocalDatabase()) {
    return {
      dialect: 'postgres',
      host: process.env.DB_HOST_LOCAL ?? 'localhost',
      port: Number(process.env.DB_PORT_LOCAL ?? 5432),
      username: process.env.DB_USER_LOCAL ?? 'postgres',
      password: process.env.DB_PASSWORD_LOCAL ?? '',
      database: process.env.DB_NAME_LOCAL ?? 'postgres',
    };
  }

  return {
    dialect: 'postgres',
    host: process.env.DB_HOST_PROD ?? 'localhost',
    port: Number(process.env.DB_PORT_PROD ?? 5432),
    username: process.env.DB_USER_PROD ?? 'postgres',
    password: process.env.DB_PASSWORD_PROD ?? '',
    database: process.env.DB_NAME_PROD ?? 'postgres',
  };
}
