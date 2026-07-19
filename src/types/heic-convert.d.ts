declare module 'heic-convert' {
  type HeicConvertInput = {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  };

  export default function convert(input: HeicConvertInput): Promise<Uint8Array>;
}
