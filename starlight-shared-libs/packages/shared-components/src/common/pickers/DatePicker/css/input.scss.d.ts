declare namespace InputScssNamespace {
  export interface IInputScss {
    borderError: string;
    datePicker: string;
    disabled: string;
    error: string;
  }
}

declare const InputScssModule: InputScssNamespace.IInputScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InputScssNamespace.IInputScss;
};

export = InputScssModule;
