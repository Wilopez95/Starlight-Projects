declare namespace StylesScssNamespace {
  export interface IStylesScss {
    arrow: string;
    borderless: string;
    checkbox: string;
    checkboxBlock: string;
    checkboxCross: string;
    checkboxOption: string;
    checkboxOptionList: string;
    checkboxOptionWrapper: string;
    container: string;
    control: string;
    controls: string;
    cross: string;
    disabled: string;
    divider: string;
    error: string;
    hint: string;
    icon: string;
    label: string;
    multiLabel: string;
    noOptions: string;
    oneSide: string;
    optionItem: string;
    optionList: string;
    placeholder: string;
    rotate: string;
    validationText: string;
    wrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
