declare namespace StylesScssNamespace {
  export interface IStylesScss {
    gray: string;
    hint: string;
    subsection: string;
    title: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
