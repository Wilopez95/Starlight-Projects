declare namespace StylesScssNamespace {
  export interface IStylesScss {
    author: string;
    disabled: string;
    download: string;
    fileName: string;
    modalAction: string;
    sendToEmail: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
