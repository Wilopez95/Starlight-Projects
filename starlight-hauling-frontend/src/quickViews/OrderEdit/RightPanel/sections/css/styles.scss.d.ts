declare namespace StylesScssNamespace {
  export interface IStylesScss {
    add: string;
    addPromo: string;
    assignEquipmentItem: string;
    bestTimeToComeRange: string;
    checkboxLabel: string;
    checkboxMessageOnlyLabel: string;
    checkboxes: string;
    closeIcon: string;
    contactFooter: string;
    disabled: string;
    divider: string;
    expirationDate: string;
    flexBlock: string;
    grandTotal: string;
    lineItemPrice: string;
    lineItemQuantity: string;
    lineItemService: string;
    lineItemServiceWrapper: string;
    lineItemTotal: string;
    lineItemUnits: string;
    linkedProjectsSubsection: string;
    modalOverlay: string;
    notify: string;
    priceTypeLabel: string;
    projectOverlay: string;
    promoSearch: string;
    promoSearchWrapper: string;
    removeIcon: string;
    removePromo: string;
    row: string;
    section: string;
    sectionSubtitle: string;
    sectionTitle: string;
    serviceBigInput: string;
    serviceSmallInput: string;
    spaceLeft: string;
    spaceRight: string;
    summaryContainer: string;
    validationText: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
