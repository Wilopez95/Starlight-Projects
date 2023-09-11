declare namespace StylesScssNamespace {
  export interface IStylesScss {
    alert: string;
    alternative: string;
    banner: string;
    closeIcon: string;
    default: string;
    edit: string;
    grey: string;
    icon: string;
    information: string;
    neutral: string;
    primary: string;
    purple: string;
    secondary: string;
    success: string;
    white: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
