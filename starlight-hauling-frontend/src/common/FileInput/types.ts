export interface IFileInput {
  label: string;
  name: string;
  acceptMimeTypes?: FileInputMimeTypes[];
  value?: File;
  error?: string;
  onChange(name: string, value?: File): void;
}

type FileInputMimeTypes = 'image/jpeg' | 'image/png' | 'application/pdf' | 'image/webp';
