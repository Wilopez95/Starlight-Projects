import { DropEvent, FileRejection } from 'react-dropzone';

import { FileGalleryMediaItem } from '../FilesGallery/types';

interface NonModifiableFilePreviewGallery {
  data: FileGalleryMediaItem[];
  modifiable?: false;
}

interface ModifiableFilePreviewGallery {
  modifiable: true;
  data: FileGalleryMediaItem[];
  acceptMimeTypes: string[];
  onRemove: (index: number) => void;
  onFileAdded?: (index: number, file: File) => void;
  onFileRejected?: (rejection: FileRejection, event: DropEvent) => void;
}

export type FilePreviewGalleryProps =
  | NonModifiableFilePreviewGallery
  | ModifiableFilePreviewGallery;
