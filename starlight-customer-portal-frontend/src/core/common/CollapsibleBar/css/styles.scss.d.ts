declare namespace StylesScssNamespace {
  export interface IStylesScss {
    absolute: string;
    arrow: string;
    barContainer: string;
    beforeIcon: string;
    container: string;
    hidden: string;
    imageContainer: string;
    open: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
