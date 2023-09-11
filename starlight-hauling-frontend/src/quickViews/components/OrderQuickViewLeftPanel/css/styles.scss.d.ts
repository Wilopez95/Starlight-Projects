declare namespace StylesScssNamespace {
  export interface IStylesScss {
    badge: string;
    completedBadge: string;
    workOrder: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
