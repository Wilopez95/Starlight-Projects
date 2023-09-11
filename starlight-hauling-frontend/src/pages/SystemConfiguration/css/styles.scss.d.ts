declare namespace StylesScssNamespace {
  export interface IStylesScss {
    customRow: string;
    specialCell: string;
    systemConfigurationPage: string;
    tableCellAction: string;
    tableCellDescription: string;
    tableCellTitle: string;
    tableHeadTitle: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
