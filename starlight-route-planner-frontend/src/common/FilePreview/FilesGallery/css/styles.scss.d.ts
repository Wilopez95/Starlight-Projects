declare namespace StylesScssNamespace {
  export interface IStylesScss {
    arrow: string;
    disabled: string;
    modal: string;
    modalContainer: string;
    modalImage: string;
    modalPreview: string;
    pdfPlaceholder: string;
    rightArrow: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
