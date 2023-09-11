import { IAttachment } from '@root/types';

import { FilePreviewWithModalProps } from '../FilePreviewWithModal/types';

export type FileGalleryMediaItem = Omit<FilePreviewWithModalProps, 'onRemoveClick'>;

export interface IFilesGallery {
  media: FileGalleryMediaItem[] | IAttachment[];
  onRemove?(): void;
}

export interface IFilesGalleryHandle {
  activeIndex: number | null;
  handleOpen(index?: number): void;
  handleClose(): void;
}
