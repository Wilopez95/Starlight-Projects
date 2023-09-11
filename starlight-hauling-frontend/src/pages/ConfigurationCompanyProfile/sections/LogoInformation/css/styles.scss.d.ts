declare namespace StylesScssNamespace {
  export interface IStylesScss {
    fileUpload: string;
    fullWidth: string;
    icon: string;
    logo: string;
    logoInfo: string;
    uploadPlaceholder: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
