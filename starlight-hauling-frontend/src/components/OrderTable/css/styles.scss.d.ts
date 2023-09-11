declare namespace StylesScssNamespace {
  export interface IStylesScss {
    disabled: string;
    header: string;
    headerTitle: string;
    rows: string;
    space: string;
    ticketCell: string;
    titleContainer: string;
    unapproveButton: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
