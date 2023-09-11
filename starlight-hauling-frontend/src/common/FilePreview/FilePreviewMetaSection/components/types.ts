import { ReactElement } from 'react';

export interface IModalActionButtonProps {
  disable?: boolean;
  url?: string;
  icon?: ReactElement;
  target?: string;
  rel?: string;
  download?: boolean;
  onClick?(): void;
}
