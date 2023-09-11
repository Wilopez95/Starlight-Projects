declare namespace StylesScssNamespace {
  export interface IStylesScss {
    addPhoneNumberContainer: string;
    default: string;
    disabled: string;
    extension: string;
    first: string;
    number: string;
    removeIcon: string;
    textOnly: string;
    type: string;
    typeWrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
