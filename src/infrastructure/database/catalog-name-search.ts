import { col, fn, Op, where, type WhereOptions } from 'sequelize';

export function escapeLikePattern(term: string): string {
  return term.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function buildCatalogNameSearchWhere(columnName: string, term: string): WhereOptions {
  const pattern = `%${escapeLikePattern(term.trim())}%`;
  return where(fn('unaccent', fn('lower', col(columnName))), {
    [Op.like]: fn('unaccent', fn('lower', pattern)),
  });
}
