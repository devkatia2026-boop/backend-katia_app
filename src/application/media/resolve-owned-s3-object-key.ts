export type OwnedS3ObjectKeyConfig = {
  bucket: string;
  publicBaseUrl?: string;
};

export function resolveOwnedS3ObjectKey(
  url: string,
  config: OwnedS3ObjectKeyConfig,
): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      return null;
    }

    const base = config.publicBaseUrl?.replace(/\/$/, '');

    if (base && url.startsWith(`${base}/`)) {
      return decodeURIComponent(url.slice(base.length + 1));
    }

    const virtualHosted = parsed.hostname.match(
      /^(.+)\.s3(?:[.-]([a-z0-9-]+))?\.amazonaws\.com$/i,
    );

    if (virtualHosted?.[1] === config.bucket) {
      const key = parsed.pathname.replace(/^\//, '');
      return key.length > 0 ? decodeURIComponent(key) : null;
    }

    const pathStyle = parsed.hostname.match(/^s3(?:[.-]([a-z0-9-]+))?\.amazonaws\.com$/i);

    if (pathStyle) {
      const segments = parsed.pathname.replace(/^\//, '').split('/');

      if (segments[0] === config.bucket && segments.length > 1) {
        return decodeURIComponent(segments.slice(1).join('/'));
      }
    }

    return null;
  } catch {
    return null;
  }
}
