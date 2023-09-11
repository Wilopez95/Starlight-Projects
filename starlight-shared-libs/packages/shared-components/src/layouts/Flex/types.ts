export type FlexJustifyContent =
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'normal';

export type FlexAlignItems = 'flex-start' | 'flex-end' | 'center' | 'normal' | 'baseline';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export interface IFlexLayout {
  justifyContent?: FlexJustifyContent;
  alignItems?: FlexAlignItems;
  flexGrow?: number;
  direction?: FlexDirection;
  $wrap?: boolean;
  className?: string;
  gap?: string;
}
