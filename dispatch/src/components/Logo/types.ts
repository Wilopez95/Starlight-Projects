import { ReactNode } from 'react';

export interface ILogo {
  image?: string | null;
  defaultLogo?: string;
  updatedAt?: Date;
  icon?: ReactNode;
}
