declare namespace StylesScssNamespace {
  export interface IStylesScss {
    body: string;
    crossIcon: string;
    link: string;
    navigation: string;
    reminderBox: string;
    sidebar: string;
    tableContainer: string;
    titleAlign: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
