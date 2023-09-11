declare namespace StylesScssNamespace {
  export interface IStylesScss {
    border: string;
    column: string;
    disabled: string;
    empty: string;
    row: string;
    selected: string;
    tabGroup: string;
    tabGroupItem: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
