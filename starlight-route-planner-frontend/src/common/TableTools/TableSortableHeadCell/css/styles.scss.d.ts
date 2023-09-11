declare namespace StylesScssNamespace {
  export interface IStylesScss {
    arrow: string;
    hidden: string;
    right: string;
    sortAsc: string;
    sortDesc: string;
    sortable: string;
    sortableContainer: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
