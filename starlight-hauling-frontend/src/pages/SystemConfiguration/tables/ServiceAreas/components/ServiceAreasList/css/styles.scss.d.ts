declare namespace StylesScssNamespace {
  export interface IStylesScss {
    customRow: string;
    icon: string;
    mapContainerWrapper: string;
    overlay: string;
    tableContainerWrapper: string;
    tableIconTitle: string;
    tableWrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
