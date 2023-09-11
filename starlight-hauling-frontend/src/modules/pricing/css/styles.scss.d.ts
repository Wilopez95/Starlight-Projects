declare namespace StylesScssNamespace {
  export interface IStylesScss {
    cell: string;
    center: string;
    columnNavigation: string;
    customerColumnNavigation: string;
    customerMaterialsNavigation: string;
    equipmentItemsNavigation: string;
    expandChild: string;
    fifthWidth: string;
    finalPrice: string;
    form: string;
    formContainer: string;
    fourthWidth: string;
    globalPrice: string;
    historyLabel: string;
    inactive: string;
    infoIcon: string;
    input: string;
    inputWrapper: string;
    label: string;
    large: string;
    left: string;
    materialsNavigation: string;
    midSize: string;
    quickView: string;
    rateHistoryIcon: string;
    relative: string;
    right: string;
    skeleton: string;
    skeletonRow: string;
    spacer: string;
    surchargeGrid: string;
    tHead: string;
    table: string;
    tableCell: string;
    thresholdGrid: string;
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
