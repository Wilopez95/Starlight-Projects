import { IMasterRoute } from '@root/types';

export interface IDetailsQuickView {
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export interface IForm {
  info: IMasterRoute;
  scrollContainerHeight: number;
  onAddRef: (ref: HTMLElement | null) => void;
  onClose: () => void;
}
