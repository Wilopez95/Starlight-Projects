declare namespace StylesScssNamespace {
  export interface IStylesScss {
    autocomplete: string;
    radioContainer: string;
    serviceAreasWrapper: string;
    validDays: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
