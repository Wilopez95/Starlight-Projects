export type OffsetUnit =
  | '0'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '2.5'
  | '3'
  | '3.5'
  | '4'
  | '4.5'
  | '5'
  | '7.5'
  | 'auto';
export type ThemeOffsets = Record<OffsetUnit, string>;
