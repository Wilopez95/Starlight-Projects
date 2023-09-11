declare namespace StylesScssNamespace {
  export interface IStylesScss {
    borderless: string;
    container: string;
    control: string;
    controls: string;
    cross: string;
    disabled: string;
    error: string;
    fullWidth: string;
    icon: string;
    input: string;
    label: string;
    multiLabel: string;
    placeholder: string;
    validationText: string;
    wrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
