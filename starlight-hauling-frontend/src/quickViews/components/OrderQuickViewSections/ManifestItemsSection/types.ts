import { IOrderNewManifestItem } from '@root/types';

export interface ISelectedManifestItem extends Omit<IOrderNewManifestItem, 'unitType'> {
  url: string;
  unitType: string;
  createdAt?: Date | string;
  author?: string;
}
