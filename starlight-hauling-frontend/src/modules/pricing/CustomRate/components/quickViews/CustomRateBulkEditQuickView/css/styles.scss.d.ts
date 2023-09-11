declare namespace StylesScssNamespace {
  export interface IStylesScss {
    active: string;
    alignRight: string;
    alignSelfCenter: string;
    badge: string;
    cell: string;
    columnNavigation: string;
    currentThreshold: string;
    disabled: string;
    equipmentItemsNavigation: string;
    expandChild: string;
    fifthWidth: string;
    finalPrice: string;
    form: string;
    formContainer: string;
    formInput: string;
    fourthWidth: string;
    fullWidth: string;
    globalPrice: string;
    historyLabel: string;
    inactive: string;
    input: string;
    inputFinalPrice: string;
    inputGeneric: string;
    inputValue: string;
    inputWrapper: string;
    label: string;
    large: string;
    left: string;
    leftPadding: string;
    materialsNavigation: string;
    navigation: string;
    operationButton: string;
    operationsContainer: string;
    plus: string;
    priceChangeBlock: string;
    rateHistoryIcon: string;
    recurrentServiceHeader: string;
    removeIcon: string;
    right: string;
    selectWrapper: string;
    skeleton: string;
    skeletonRow: string;
    spacer: string;
    tableGrid: string;
    thresholdMaterials: string;
    title: string;
    unit: string;
    value: string;
    wrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
