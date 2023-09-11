declare namespace StylesScssNamespace {
  export interface IStylesScss {
    bar: string;
    dataContainer: string;
    defaultLogo: string;
    headerTitle: string;
    iconContainer: string;
    iconWrapper: string;
    languageBar: string;
    languageContainerBack: string;
    logo: string;
    logoContainer: string;
    logoImgWrapper: string;
    menuBody: string;
    menuDivider: string;
    menuIcon: string;
    menuItemImgWrapper: string;
    name: string;
    nameContainer: string;
    open: string;
    redOnHover: string;
    secondName: string;
    userContainer: string;
    userDropdownItem: string;
    userIcon: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
