export type QuickViewSize = 'full' | 'three-quarters' | 'half' | 'moderate' | 'default';
export type QuickViewLeftPanelSize = 'one-third' | 'half';

export interface ICustomQuickView {
  isOpen: boolean | null | undefined;
  clickOutContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  clickOutSelectors?: string[] | string;
  shouldDeselect?: boolean;
  onAfterClose?(): void;
  onClose?(): boolean | void;
}

export type QuickViewPaths =
  | {
      openUrl?: undefined;
      closeUrl?: undefined;
    }
  | {
      openUrl: string;
      closeUrl: string;
    };
