declare namespace StylesScssNamespace {
  export interface IStylesScss {
    comment: string;
    content: string;
    deleteIcon: string;
    header: string;
    sectionHeader: string;
    showMoreLink: string;
    subHeader: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
