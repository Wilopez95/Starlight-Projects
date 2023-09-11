export type PartialOrNull<T> = {
  [K in keyof T]?: T[K] | undefined | null;
};
