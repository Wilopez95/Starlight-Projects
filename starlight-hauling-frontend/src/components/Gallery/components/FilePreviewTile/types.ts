import { IAttachment } from '@root/types';

export interface IFilePreviewTile {
  file: IAttachment;
  index: number;
  onDelete(id: string): void;
  onOpen(id: number): void;
}
