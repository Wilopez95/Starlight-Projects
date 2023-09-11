declare namespace StylesScssNamespace {
  export interface IStylesScss {
    centered: string;
    controls: string;
    description: string;
    modal: string;
    overlay: string;
    surchargesTable: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
