import { ReactNode } from 'react';

import { TextAlign, TextTransform, Variant } from '@root/common/Typography/types';

export interface IDetailColumnItem {
  label?: string;
  children?: ReactNode;
  width?: string;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
  variant?: Variant;
}
