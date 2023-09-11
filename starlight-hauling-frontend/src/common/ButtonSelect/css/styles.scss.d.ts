declare namespace StylesScssNamespace {
  export interface IStylesScss {
    active: string;
    button: string;
    buttonSelect: string;
    column: string;
    row: string;
    validationText: string;
    wrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
