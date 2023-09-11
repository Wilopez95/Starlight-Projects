import type { OffsetUnit } from '../../theme/baseTypes';
import { FlexAlignItems, FlexJustifyContent } from '../Flex/types';

export type GridAutoFlow = 'row' | 'column';

export interface IGridLayout {
  columns?: string | number;
  rows?: string | number;
  autoRows?: string;
  flow?: GridAutoFlow;
  gap?: OffsetUnit;
  columnGap?: OffsetUnit;
  rowGap?: OffsetUnit;
  areas?: string[];
  alignItems?: FlexAlignItems;
}

export interface ICellLayout {
  width?: number;
  height?: number;
  left?: string | number;
  top?: string | number;
  area?: string;
  alignSelf?: FlexAlignItems;
  justifySelf?: FlexJustifyContent;
}
