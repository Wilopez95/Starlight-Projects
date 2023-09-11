declare namespace StylesScssNamespace {
  export interface IStylesScss {
    cancelIcon: string;
    customerPreferences: string;
    header: string;
    heading: string;
    preference: string;
    warningText: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
