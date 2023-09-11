import { ReactNode } from 'react';

export interface ITooltip {
  children: ReactNode;
  text: ReactNode;
  delay?: number;
  wrapperClassName?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  fullWidth?: boolean;
  border?: boolean;
}

export interface ITooltipLayout {
  position?: 'left' | 'right' | 'top' | 'bottom';
  hidden: boolean;
  posX: string;
  posY: string;
}
