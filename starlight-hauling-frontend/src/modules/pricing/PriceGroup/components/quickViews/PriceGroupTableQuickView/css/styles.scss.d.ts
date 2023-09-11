declare namespace StylesScssNamespace {
  export interface IStylesScss {
    buttonContainer: string;
    buttonsComponentContainer: string;
    formContainer: string;
    navigation: string;
    scrollContainer: string;
    subtitle: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
