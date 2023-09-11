declare namespace StylesScssNamespace {
  export interface IStylesScss {
    container: string;
    editable: string;
    inline: string;
    item: string;
    itemsContainer: string;
    subItem: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
