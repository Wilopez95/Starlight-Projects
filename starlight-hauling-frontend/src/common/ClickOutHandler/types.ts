import React from 'react';

export interface IClickOutHandler {
  children: React.ReactNode;
  clickOutSelectors?: string[] | string;
  subContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  skipNotification?: boolean;
  skipCalendar?: boolean;
  skipModal?: boolean;
  className?: string;
  onClickOut?(event: MouseEvent): void;
}

export type ClickOutHandlerCallback = (e: MouseEvent) => void;
