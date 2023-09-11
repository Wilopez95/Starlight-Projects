export interface IHighlightDecorator {
  children: string | number;
  property: string;
  highlight?: {
    [Key in any]?: string[];
  };
  className?: string;
  index?: number;
}
