import { FilePreviewWithModalProps } from '../FilePreviewWithModal/types';

export type FileGalleryMediaItem = Omit<FilePreviewWithModalProps, 'onRemoveClick'>;

export interface IFilesGallery {
  media: FileGalleryMediaItem[];
  onRemove?(): void;
}

export interface IFilesGalleryHandle {
  activeIndex: number | null;
  handleOpen(index: number): void;
  handleClose(): void;
}
