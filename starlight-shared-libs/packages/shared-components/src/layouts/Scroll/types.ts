export interface ILayoutScrollProps {
  width?: number;
  height?: number;
  rounded?: boolean;
  maxHeight?: number;
  minHeight?: number;
  overscrollBehavior?: 'contain';
  overflowY?: 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto';
  scrollReverse?: boolean;
}
