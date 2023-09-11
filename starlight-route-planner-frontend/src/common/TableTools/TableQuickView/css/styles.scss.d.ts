declare namespace StylesScssNamespace {
  export interface IStylesScss {
    buttonContainer: string;
    cancelButton: string;
    dataContainer: string;
    descriptionPanel: string;
    flex: string;
    half: string;
    header: string;
    label: string;
    quickViewDescription: string;
    quickViewTitle: string;
    row: string;
    scrollContainer: string;
    spaceLeft: string;
    spaceRight: string;
    table: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
