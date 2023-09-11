import { DropEvent, FileError, FileRejection } from 'react-dropzone';

export interface IFileUpload {
  acceptMimeTypes: string[];
  onDropAccepted(files: File[], event: DropEvent): void;
  onDropRejected(fileRejections: FileRejection[], event: DropEvent): void;
  validator(file: File): FileError | null;
}
