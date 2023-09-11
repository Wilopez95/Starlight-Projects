declare namespace StylesScssNamespace {
  export interface IStylesScss {
    backLink: string;
    customers: string;
    header: string;
    heading: string;
    sidebar: string;
    subHeading: string;
    summary: string;
    summaryItem: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
