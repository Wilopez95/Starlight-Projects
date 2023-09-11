declare namespace StylesScssNamespace {
  export interface IStylesScss {
    activeCheckbox: string;
    buttonsComponentContainer: string;
    checkboxRow: string;
    formContainer: string;
    space: string;
    spaceSmall: string;
    validationText: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
