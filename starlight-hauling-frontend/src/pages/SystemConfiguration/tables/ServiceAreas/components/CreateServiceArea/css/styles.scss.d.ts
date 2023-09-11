declare namespace StylesScssNamespace {
  export interface IStylesScss {
    fullWidth: string;
    instructions: string;
    left: string;
    mapboxContainer: string;
    pageContainer: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
