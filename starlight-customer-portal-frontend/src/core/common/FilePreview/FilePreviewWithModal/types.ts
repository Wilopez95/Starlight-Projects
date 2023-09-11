import { IFilePreviewIcon } from '../FilePreviewIcon/types';

export type FilePreviewWithModalProps = Omit<IFilePreviewIcon, 'onClick'> & {
  timestamp?: Date | null;
  author?: string | null;
  hideAuthor?: boolean;
  downloadSrc?: string;
  fileIsNoViewable?: boolean;
  extension?: string;
};
