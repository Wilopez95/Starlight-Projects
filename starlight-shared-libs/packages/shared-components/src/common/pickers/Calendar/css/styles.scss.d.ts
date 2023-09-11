declare namespace StylesScssNamespace {
  export interface IStylesScss {
    caption: string;
    container: string;
    day: string;
    disabled: string;
    errorMessage: string;
    month: string;
    navBar: string;
    navButton: string;
    navButtonNext: string;
    navButtonPrev: string;
    selected: string;
    weekday: string;
    wrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
