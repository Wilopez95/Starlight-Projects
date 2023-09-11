import { ReactNode } from 'react';
import * as React from 'react';

export interface ILobbyMenuItem {
  title: string;
  path: string;
  address?: string;
  image?: string | null;
  icon?: ReactNode;
  defaultLogo?: string;
  updatedAt?: Date;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  isFirstItem?: boolean;
}
