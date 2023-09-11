declare namespace BaseScssNamespace {
  export interface IBaseScss {
    fallbackOnlyForSCSSModulesTypings: string;
    visuallyHidden: string;
  }
}

declare const BaseScssModule: BaseScssNamespace.IBaseScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: BaseScssNamespace.IBaseScss;
};

export = BaseScssModule;
