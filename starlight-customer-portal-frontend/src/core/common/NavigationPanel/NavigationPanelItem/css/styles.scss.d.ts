declare namespace StylesScssNamespace {
  export interface IStylesScss {
    active: string;
    badge: string;
    buttonContainer: string;
    container: string;
    icon: string;
    inner: string;
    label: string;
    navigationItem: string;
    navigationItemContainer: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
