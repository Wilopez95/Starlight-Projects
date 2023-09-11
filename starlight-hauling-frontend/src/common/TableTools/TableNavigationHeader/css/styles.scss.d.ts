declare namespace StylesScssNamespace {
  export interface IStylesScss {
    fullSize: string;
    input: string;
    itemsContainer: string;
    loading: string;
    searchContainer: string;
    tableHeader: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
