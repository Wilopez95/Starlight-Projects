import * as React from 'react';

export interface IClickOutHandler {
  children: React.ReactNode;
  clickOutSelectors?: string[] | string;
  subContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  skipNotification?: boolean;
  skipModal?: boolean;
  className?: string;
  onClickOut?(event: MouseEvent): void;
}

// eslint-disable-next-line
export type ClickOutHandlerCallback = (e: any) => void;
