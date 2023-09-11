declare namespace StylesScssNamespace {
  export interface IStylesScss {
    capitalize: string;
    cell: string;
    cellContainer: string;
    center: string;
    emptyTh: string;
    full: string;
    link: string;
    right: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
