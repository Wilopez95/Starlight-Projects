import React from 'react';

export interface IClickOutHandler {
  children: React.ReactNode;
  clickOutSelectors?: string[];
  onClickOut?(event: MouseEvent): void;
  subContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  skipNotification?: boolean;
  skipModal?: boolean;
  className?: string;
}

export type ClickOutHandlerCallback = (e: any) => void;
