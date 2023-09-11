declare namespace StylesScssNamespace {
  export interface IStylesScss {
    arrow: string;
    disabled: string;
    fileExtension: string;
    modal: string;
    modalContainer: string;
    modalImage: string;
    modalPreview: string;
    noViewableFile: string;
    rightArrow: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
