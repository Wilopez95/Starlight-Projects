declare namespace StylesScssNamespace {
  export interface IStylesScss {
    activeCheckbox: string;
    buttonContainer: string;
    buttonsComponentContainer: string;
    checkbox: string;
    formContainer: string;
    frequencyListSpace: string;
    label: string;
    navigation: string;
    quickViewDescription: string;
    quickViewTitle: string;
    space: string;
    systemCheckbox: string;
    thresholds: string;
    thresholdsTitle: string;
    validDays: string;
    validationText: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
