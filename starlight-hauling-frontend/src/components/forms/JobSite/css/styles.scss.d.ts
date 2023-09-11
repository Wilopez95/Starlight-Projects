declare namespace StylesScssNamespace {
  export interface IStylesScss {
    autocomplete: string;
    autocompleteWrapper: string;
    item: string;
    itemWrapper: string;
    leftSide: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
