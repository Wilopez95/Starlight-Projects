declare namespace StylesScssNamespace {
  export interface IStylesScss {
    buttonContainer: string;
    deleteButton: string;
    flexEnd: string;
    spaceLeft: string;
    spaceRight: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
