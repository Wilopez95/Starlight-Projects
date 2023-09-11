export interface IHighlightDecorator {
  children: string | number;
  highlight: {
    [Key in any]?: string[];
  };
  property: string;
  className?: string;
  index?: number;
}
