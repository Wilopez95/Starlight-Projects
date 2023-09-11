import { ReactNode } from 'react';

import { SvgComponent } from '../../types/base';

export interface ICollapsibleBar {
  label?: ReactNode;
  beforeIcon?: SvgComponent;
  onClick?: () => void;
  open?: boolean;
  absolute?: boolean;
  containerClassName?: string;
  beforeIconClassName?: string;
  openedClassName?: string;
  duration?: number;
  marginizeArrow?: boolean;
  arrowLeft?: boolean;
  shouldCloseOnClickOut?: boolean;
}
