import { ReactNode } from 'react';

import { SvgComponent } from '@root/core/types';

export interface ICollapsibleBar {
  label?: ReactNode;
  beforeIcon?: SvgComponent;
  onClick?: () => void;
  open?: boolean;
  closeOnClickOut?: boolean;
  absolute?: boolean;
  containerClassName?: string;
  beforeIconClassName?: string;
}
