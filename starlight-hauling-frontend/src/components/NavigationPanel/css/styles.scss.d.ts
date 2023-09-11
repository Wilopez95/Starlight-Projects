declare namespace StylesScssModule {
  export interface IStylesScss {
    navigationPanelContainer: string;
  }
}

declare const StylesScssModule: StylesScssModule.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssModule.IStylesScss;
};

export = StylesScssModule;
