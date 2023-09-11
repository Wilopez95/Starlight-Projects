declare namespace StylesScssNamespace {
  export interface IStylesScss {
    activeCheckbox: string;
    emptyCell: string;
    errorButton: string;
    fileActionIcon: string;
    fileUpload: string;
    fileUploadContainer: string;
    fileUploadControls: string;
    formContainer: string;
    label: string;
    space: string;
    uploadButton: string;
    uploadIcon: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
