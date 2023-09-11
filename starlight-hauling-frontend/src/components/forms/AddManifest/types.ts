import { IOrderNewManifestItem } from '@root/types';

export interface INewManifestWithFile extends Omit<IOrderNewManifestItem, 'materialId'> {
  materialId: number | null;
  file?: File;
}
