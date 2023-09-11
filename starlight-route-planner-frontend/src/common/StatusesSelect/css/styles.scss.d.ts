declare namespace StylesScssNamespace {
  export interface IStylesScss {
    arrow: string;
    borderless: string;
    checkboxBlock: string;
    container: string;
    control: string;
    controls: string;
    cross: string;
    disabled: string;
    divider: string;
    error: string;
    fullWidth: string;
    icon: string;
    label: string;
    noOptions: string;
    nonClearable: string;
    oneSide: string;
    optionItem: string;
    optionList: string;
    placeholder: string;
    validationText: string;
    wrapper: string;
    wrapperOptionItem: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
