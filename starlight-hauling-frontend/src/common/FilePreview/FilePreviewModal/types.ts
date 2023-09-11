import { IModal } from '@root/common/Modal/types';

import { IFilePreviewIcon } from '../FilePreviewIcon/types';

// Discriminated union on `withMeta`
interface IFilePreviewModalWithMeta extends IFilePreviewIcon, IModal {
  withMeta: true;
  fileName: string;
  timestamp?: Date | null;
  author?: string | null;
  hideAuthor?: boolean;
  downloadSrc?: string;
}

interface ISimpleFilePreviewModal extends IFilePreviewIcon, IModal {
  withMeta?: false;
}

export type IFilePreviewModal = IFilePreviewModalWithMeta | ISimpleFilePreviewModal;
