declare namespace StylesScssNamespace {
  export interface IStylesScss {
    'sui-checkbox-input-wrapper': string;
    'sui-checkbox-text': string;
    'sui-form': string;
    'sui-form-actions': string;
    'sui-form-element': string;
    'sui-form__error': string;
    'sui-form__hint': string;
    'sui-radio-options': string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
