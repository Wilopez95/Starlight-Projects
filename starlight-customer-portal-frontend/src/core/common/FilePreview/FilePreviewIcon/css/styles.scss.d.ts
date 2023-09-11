declare namespace StylesScssNamespace {
  export interface IStylesScss {
    container: string;
    deleteIcon: string;
    large: string;
    pdfPlaceholder: string;
    preview: string;
    small: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
