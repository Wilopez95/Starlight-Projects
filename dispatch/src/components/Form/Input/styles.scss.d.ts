declare namespace StylesScssNamespace {
  export interface IStylesScss {
    placeholder: string;
    'sui-disabled': string;
    'sui-has-error': string;
    'sui-text-input': string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
