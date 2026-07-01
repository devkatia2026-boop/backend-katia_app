import { col, fn, Op, where, type WhereOptions } from 'sequelize';

const SEARCH_COLUMNS = ['name', 'type', 'description', 'level', 'objective', 'bother'] as const;

function escapeLikePattern(term: string): string {
  return term.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function unaccentLikeCondition(columnName: string, pattern: string) {
  return where(fn('unaccent', fn('lower', col(columnName))), {
    [Op.like]: fn('unaccent', fn('lower', pattern)),
  });
}

export function buildProgramSearchWhere(search: string | undefined): WhereOptions | undefined {
  if (!search) return undefined;
  const pattern = `%${escapeLikePattern(search)}%`;
  return {
    [Op.or]: SEARCH_COLUMNS.map((column) => unaccentLikeCondition(column, pattern)),
  };
}

export function mergeProgramWhere(
  base: WhereOptions,
  search: string | undefined
): WhereOptions {
  const searchWhere = buildProgramSearchWhere(search);
  if (!searchWhere) return base;
  if (Object.keys(base).length === 0) return searchWhere;
  return { [Op.and]: [base, searchWhere] };
}
