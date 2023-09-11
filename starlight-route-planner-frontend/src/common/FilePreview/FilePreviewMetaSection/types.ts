export interface IFilePreviewMetaSection {
  fileName: string;
  src?: string;
  timestamp?: Date | null;
  author?: string | null;
  hideAuthor?: boolean;
  downloadSrc?: string;
  onRemove?(): void;
}
