export interface IFilePreviewIcon {
  fileName: string;
  category: string;
  src?: string;
  isPdf?: boolean;
  size?: 'large' | 'small';
  onClick?(): void;
  onRemoveClick?(): void;
}
