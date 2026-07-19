export const REMOTE_MEDIA_ALLOWED_HOST_SUFFIXES = ['.amazonaws.com'] as const;

const HEIC_EXTENSIONS = ['.heic', '.heif'] as const;
const HEIC_MIME_MARKERS = ['heic', 'heif'] as const;
const HEIC_BRANDS = ['heic', 'heix', 'mif1', 'msf1', 'hevc', 'hevx'] as const;

export function assertAllowedRemoteMediaUrl(value: string): void {
  if (!isAllowedRemoteMediaUrl(value)) {
    const err = new Error('URL de mídia não permitida.');
    err.name = 'ValidationException';
    throw err;
  }
}

export function isAllowedRemoteMediaUrl(value: string): boolean {
  try {
    const parsed = new URL(value);

    if (parsed.protocol !== 'https:') {
      return false;
    }

    return REMOTE_MEDIA_ALLOWED_HOST_SUFFIXES.some((suffix) =>
      parsed.hostname.endsWith(suffix),
    );
  } catch {
    return false;
  }
}

export function isHeicRemoteSource(
  url: string,
  contentType: string | null,
  buffer: Buffer,
): boolean {
  const normalizedUrl = url.split('?')[0]?.toLowerCase() ?? '';

  if (HEIC_EXTENSIONS.some((extension) => normalizedUrl.endsWith(extension))) {
    return true;
  }

  const normalizedType = contentType?.toLowerCase() ?? '';

  if (HEIC_MIME_MARKERS.some((marker) => normalizedType.includes(marker))) {
    return true;
  }

  if (buffer.length < 12) {
    return false;
  }

  const brand = buffer.subarray(8, 12).toString('ascii');
  return HEIC_BRANDS.includes(brand as (typeof HEIC_BRANDS)[number]);
}

export function resolveRemoteImageContentType(
  url: string,
  contentType: string | null,
): string {
  const normalizedType = contentType?.split(';')[0]?.trim().toLowerCase() ?? '';

  if (normalizedType.startsWith('image/')) {
    return normalizedType;
  }

  const normalizedUrl = url.split('?')[0]?.toLowerCase() ?? '';

  if (normalizedUrl.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedUrl.endsWith('.webp')) {
    return 'image/webp';
  }

  if (normalizedUrl.endsWith('.gif')) {
    return 'image/gif';
  }

  if (normalizedUrl.endsWith('.heic')) {
    return 'image/heic';
  }

  if (normalizedUrl.endsWith('.heif')) {
    return 'image/heif';
  }

  return 'image/jpeg';
}
