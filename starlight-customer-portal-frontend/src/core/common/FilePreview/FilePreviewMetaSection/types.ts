export interface IFilePreviewMetaSection {
  fileName: string;
  src?: string;
  timestamp?: Date | null;
  author?: string | null;
  hideAuthor?: boolean;
  downloadSrc?: string;
  disableSendEmail?: boolean;
  disableRemove?: boolean;
  disableDownload?: boolean;
  showSendEmail?: boolean;
  onRemove?(): void;
}
