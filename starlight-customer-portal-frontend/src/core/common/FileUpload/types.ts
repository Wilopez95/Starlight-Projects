import { DropEvent, FileRejection } from 'react-dropzone';

export interface IFileUpload {
  acceptMimeTypes: string[];
  loading?: boolean;
  error?: boolean;
  isPdf?: boolean;
  allowMultiple?: boolean;
  previewImage?: string | null;
  className?: string;
  placeholder?: React.ReactNode;
  size?: 'large' | 'small';
  onDropAccepted<T extends File>(files: T[], event: DropEvent): void;
  onDropRejected(fileRejections: FileRejection[], event: DropEvent): void;
  onPreviewOpen?(event: React.MouseEvent<HTMLElement>): void;
}

export interface IFileUploadHandle {
  open(): void;
}
