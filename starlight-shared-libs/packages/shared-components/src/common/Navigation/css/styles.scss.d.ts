declare namespace StylesScssNamespace {
  export interface IStylesScss {
    border: string;
    column: string;
    columnWarning: string;
    disabled: string;
    empty: string;
    row: string;
    rowWarning: string;
    selected: string;
    tabGroup: string;
    tabGroupItem: string;
    warning: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
