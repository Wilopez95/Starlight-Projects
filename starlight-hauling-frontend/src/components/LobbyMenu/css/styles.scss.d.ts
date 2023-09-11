declare namespace StylesScssNamespace {
  export interface IStylesScss {
    address: string;
    chooseUnit: string;
    defaultLogo: string;
    ellipsisTitle: string;
    menuItem: string;
    menuItemIcon: string;
    menuItemIconWrapper: string;
    menuItemImgWrapper: string;
    menuItemWrapper: string;
    rightArrow: string;
    title: string;
    wrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
