import React from 'react';

import { SvgComponent } from '@root/types';

export interface Config<T> {
  Component: React.FC<T>;
  title: string;
  icon: SvgComponent;
  path: string;
  separated?: boolean;
  exact?: boolean;
  hideTab?: boolean;
}
