declare namespace StylesScssNamespace {
  export interface IStylesScss {
    address: string;
    header: string;
    label: string;
    name: string;
    tabGroup: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
