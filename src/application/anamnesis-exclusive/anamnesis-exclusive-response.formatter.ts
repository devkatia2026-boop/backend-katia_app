import {
  ANAMNESIS_EXCLUSIVE_MULTI_LINK_FIELDS,
  type AnamnesisExclusiveMultiLinkField,
} from './anamnesis-exclusive-file-fields';
import type { AnamnesisExclusiveDTO } from '../ports/anamnesis-exclusive.port';

export type AnamnesisExclusiveResponse = Omit<
  AnamnesisExclusiveDTO,
  AnamnesisExclusiveMultiLinkField
> & {
  photos_posture: string[] | null;
  photos_up_leg: string[] | null;
  photos_up_arms: string[] | null;
  photos_up_leg_dois: string[] | null;
};

function parseMultiLinkValue(value: string | null): string[] | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        const urls = parsed
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        return urls.length > 0 ? urls : null;
      }
    } catch {
      return [trimmed];
    }
  }
  return [trimmed];
}

export function formatAnamnesisExclusiveResponse(record: AnamnesisExclusiveDTO): AnamnesisExclusiveResponse {
  const { photos_posture, photos_up_leg, photos_up_arms, photos_up_leg_dois, ...rest } = record;
  return {
    ...rest,
    photos_posture: parseMultiLinkValue(photos_posture),
    photos_up_leg: parseMultiLinkValue(photos_up_leg),
    photos_up_arms: parseMultiLinkValue(photos_up_arms),
    photos_up_leg_dois: parseMultiLinkValue(photos_up_leg_dois),
  };
}

export function serializeMultiLinkInput(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    const urls = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (urls.length === 0) return null;
    return JSON.stringify(urls);
  }
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string, array de URLs ou null.`);
    err.name = 'ValidationException';
    throw err;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        const urls = parsed
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        if (urls.length === 0) return null;
        return JSON.stringify(urls);
      }
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export function isMultiLinkFieldFilled(value: string | null): boolean {
  const parsed = parseMultiLinkValue(value);
  return parsed !== null && parsed.length > 0;
}

export function isMultiLinkField(field: string): field is AnamnesisExclusiveMultiLinkField {
  return (ANAMNESIS_EXCLUSIVE_MULTI_LINK_FIELDS as readonly string[]).includes(field);
}
