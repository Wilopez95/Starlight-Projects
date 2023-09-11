declare namespace StylesScssNamespace {
  export interface IStylesScss {
    addPhone: string;
    checkbox: string;
    full: string;
    phoneRow: string;
    resetPassword: string;
    selectSize: string;
    selectWrapper: string;
    status: string;
    subTitle: string;
    title: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
