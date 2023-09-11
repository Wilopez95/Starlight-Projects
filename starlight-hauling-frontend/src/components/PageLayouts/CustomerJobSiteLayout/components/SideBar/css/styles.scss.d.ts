declare namespace StylesScssNamespace {
  export interface IStylesScss {
    jobSitesNavigation: string;
    linkJobSite: string;
    linkedSettings: string;
    plus: string;
    sidebar: string;
    switch: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
