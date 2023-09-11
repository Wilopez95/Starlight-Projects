declare namespace StylesScssNamespace {
  export interface IStylesScss {
    area: string;
    error: string;
    half: string;
    hiddenIcon: string;
    input: string;
    inputContainer: string;
    label: string;
    leftIcon: string;
    nonCountable: string;
    onlyBorderError: string;
    validationText: string;
    wrap: string;
    disabled: string;
    readOnly: string;
    confirmed: string;
    left: string;
    right: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
