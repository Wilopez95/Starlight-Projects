import { IProrationLineItem } from '../../types';

export interface IProrationItemComponent
  extends Pick<IProrationLineItem, 'price' | 'prorationEffectivePrice'> {
  name: string;
  label: string;
}
