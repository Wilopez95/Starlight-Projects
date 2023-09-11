declare namespace TaxRatesStylesScssNamespace {
  export interface ITaxRatesStylesScss {
    disabled: string;
    groupTaxInput: string;
    label: string;
    navigation: string;
    quickViewClassName: string;
    scrollContainer: string;
    settingItem: string;
    settings: string;
    skeleton: string;
    skeletonRow: string;
    taxName: string;
    taxRow: string;
    taxes: string;
    upperCase: string;
    wrapper: string;
  }
}

declare const TaxRatesStylesScssModule: TaxRatesStylesScssNamespace.ITaxRatesStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TaxRatesStylesScssNamespace.ITaxRatesStylesScss;
};

export = TaxRatesStylesScssModule;
