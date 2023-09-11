declare namespace StylesScssNamespace {
  export interface IStylesScss {
    applyCompanyProfile: string;
    businessLine: string;
    businessLineList: string;
    buttonContainer: string;
    column: string;
    content: string;
    fullWidth: string;
    linesError: string;
    row: string;
    section: string;
    small: string;
    spaceBottom: string;
    visible: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
