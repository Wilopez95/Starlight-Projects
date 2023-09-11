import { IModal } from '@starlightpro/shared-components';

import { IFilePreviewIcon } from '../FilePreviewIcon/types';

// Discriminated union on `withMeta`
interface IFilePreviewModalWithMeta extends IFilePreviewIcon, IModal {
  withMeta: true;
  fileName: string;
  timestamp?: Date | null;
  author?: string | null;
  hideAuthor?: boolean;
  downloadSrc?: string;
  scrollable?: boolean;
  showSendEmail?: boolean;
}

interface ISimpleFilePreviewModal extends IFilePreviewIcon, IModal {
  withMeta?: false;
  scrollable?: boolean;
  showSendEmail?: boolean;
}

export type IFilePreviewModal = IFilePreviewModalWithMeta | ISimpleFilePreviewModal;
