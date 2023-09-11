import { FileUpload } from 'graphql-upload';

export type UploadedFileResponse = {
  filename: string;
  mimetype: string;
  encoding: string;
  url: string;
};

export interface UploadFileOptions {
  file: FileUpload;
  pathEntries?: string[];
  projectFolder?: string;
}

export enum FileDeleteResult {
  OK = 'OK',
  NOT_FOUND = 'NOT_FOUND',
}

export abstract class FileUploadService {
  abstract uploadFile(options: UploadFileOptions): Promise<UploadedFileResponse>;
  abstract deleteFile(url: string): Promise<FileDeleteResult>;
}
