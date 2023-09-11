declare namespace StylesScssNamespace {
  export interface IStylesScss {
    dragActive: string;
    error: string;
    fileUpload: string;
    large: string;
    loader: string;
    loading: string;
    placeholder: string;
    small: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
