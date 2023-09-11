import { ReactNode } from 'react';

export interface IAccordion {
  isOpen: boolean;
  label?: ReactNode;
  actionButton?: ReactNode;
  containerClassName?: string;
  headerClassName?: string;
  toggleOpen(): void;
}
