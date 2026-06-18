export type StoredObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export interface IObjectStorage {
  putObject(input: StoredObjectInput): Promise<string>;
}
