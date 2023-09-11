declare namespace StylesScssNamespace {
  export interface IStylesScss {
    calculationTable: string;
    centered: string;
    controls: string;
    description: string;
    modal: string;
    overlay: string;
    summarySection: string;
    summaryTable: string;
    taxesSection: string;
    title: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
