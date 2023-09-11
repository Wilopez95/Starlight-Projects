declare namespace StylesScssNamespace {
  export interface IStylesScss {
    disabled: string;
    icon: string;
    linkedItem: string;
    subTitle: string;
    textContainer: string;
    title: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
