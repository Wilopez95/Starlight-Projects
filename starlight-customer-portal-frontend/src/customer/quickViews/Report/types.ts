import { MutableRefObject } from 'react';

export type IReportQuickViewContent = {
  onClose: () => void;
};

export type IReportQuickView = {
  parentRef: MutableRefObject<HTMLElement | null>;
};
