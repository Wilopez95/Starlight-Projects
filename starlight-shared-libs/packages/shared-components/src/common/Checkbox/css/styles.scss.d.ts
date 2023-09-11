declare namespace StylesScssNamespace {
  export interface IStylesScss {
    checkmark: string;
    error: string;
    focus: string;
    hiddenInput: string;
    label: string;
    text: string;
    visuallyHidden: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
