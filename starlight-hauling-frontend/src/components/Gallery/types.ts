import { DropEvent } from 'react-dropzone';

import { IAttachment } from '@root/types';

export interface IGallery {
  loaded: boolean;
  loading: boolean;
  files: IAttachment[];
  loadMore(): void;
  onAddFiles(files: File[], event: DropEvent): void;
  onDelete(id: string): void;
}
