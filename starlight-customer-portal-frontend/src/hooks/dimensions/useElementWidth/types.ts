export interface IUseElementWidthOptions {
  liveUpdates?: boolean;
}

export type UseElementWidthHook = [(node: HTMLElement | null) => void, number];
