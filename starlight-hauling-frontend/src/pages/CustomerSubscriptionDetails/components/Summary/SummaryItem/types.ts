import { ITypographyLayout } from '@root/common/Typography/types';

export interface ISummaryItem
  extends Pick<ITypographyLayout, 'fontWeight' | 'onClick' | 'textDecoration'> {
  label: string;
  width: string;
  price?: number;
  value?: string;
  tabIndex?: number;
}
