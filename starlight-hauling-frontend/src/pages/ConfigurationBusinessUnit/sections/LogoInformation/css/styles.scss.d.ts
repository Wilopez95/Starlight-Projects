declare namespace StylesScssNamespace {
  export interface IStylesScss {
    action: string;
    button: string;
    fileUpload: string;
    fileUploadActions: string;
    icon: string;
    line1: string;
    line2: string;
    logo: string;
    logoInformation: string;
    nameContainer: string;
    preview: string;
    uploadPlaceholder: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
