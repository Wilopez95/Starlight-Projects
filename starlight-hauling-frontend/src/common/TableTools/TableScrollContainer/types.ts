import { ReactNode } from 'react';

export interface ITableScrollContainer {
  children: ReactNode;
  tableNavigation?: ReactNode;
  className?: string;
  scrollClassName?: string;
}
