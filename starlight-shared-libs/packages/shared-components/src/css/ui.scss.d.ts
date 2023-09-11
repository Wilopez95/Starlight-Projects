declare namespace UiScssNamespace {
  export interface IUiScss {
    fallbackOnlyForSCSSModulesTypings: string;
  }
}

declare const UiScssModule: UiScssNamespace.IUiScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UiScssNamespace.IUiScss;
};

export = UiScssModule;
