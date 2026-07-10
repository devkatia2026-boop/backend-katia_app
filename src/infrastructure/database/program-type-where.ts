import { col, fn, Op, where, type WhereOptions } from 'sequelize';
import type { ProgramTypeFilter } from '../../application/ports/programs.port';

export function appendWhere(base: WhereOptions, extra: WhereOptions): WhereOptions {
  if (Object.keys(base).length === 0) return extra;
  return { [Op.and]: [base, extra] };
}

function typeEquals(value: string): WhereOptions {
  return where(fn('lower', col('type')), value.toLowerCase());
}

function typeAmbosWhere(): WhereOptions {
  return {
    [Op.or]: [
      where(fn('lower', col('type')), 'ambos'),
      where(fn('lower', col('type')), 'casa/academia'),
    ],
  };
}

export function buildProgramTypeFilterWhere(type: ProgramTypeFilter): WhereOptions {
  if (type === 'casa') return typeEquals('casa');
  if (type === 'academia') return typeEquals('academia');
  return typeAmbosWhere();
}

export function buildProgramTypeCountWhere(
  base: WhereOptions,
  type: 'casa' | 'academia' | 'ambos'
): WhereOptions {
  if (type === 'ambos') return appendWhere(base, typeAmbosWhere());
  return appendWhere(base, typeEquals(type));
}
