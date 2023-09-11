import React from 'react';

import { ILogo } from '@root/core/common/Logo/types';

export interface ILobbyMenuItem extends ILogo {
  title: string;
  path: string;
  address?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}
