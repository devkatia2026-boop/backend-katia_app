export type StoredObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type StoredObjectOutput = {
  buffer: Buffer;
  contentType: string | null;
};

export interface IObjectStorage {
  putObject(input: StoredObjectInput): Promise<string>;
  getObjectByPublicUrl(url: string): Promise<StoredObjectOutput | null>;
}
