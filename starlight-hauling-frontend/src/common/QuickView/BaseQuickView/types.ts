import React from 'react';

import { QuickViewSize } from '../types';

export interface IBaseQuickView {
  children: React.ReactNode;
  isOpen: boolean | null | undefined;
  clickOutContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  clickOutSelectors?: string[] | string;
  size?: QuickViewSize;
  overlay?: boolean;
  disableCross?: boolean;
  openUrl?: string;
  closeUrl?: string;
  onClose(): void;
  onAfterClose(): void;
}
