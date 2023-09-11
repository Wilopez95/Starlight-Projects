declare namespace StylesScssNamespace {
  export interface IStylesScss {
    'flatpickr-calendar': string;
    'flatpickr-monthSelect-month': string;
    'flatpickr-next-month': string;
    'flatpickr-prev-month': string;
    'flatpickr-rContainer': string;
    selected: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
