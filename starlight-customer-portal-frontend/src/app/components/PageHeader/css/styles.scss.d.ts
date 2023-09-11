declare namespace StylesScssNamespace {
  export interface IStylesScss {
    bar: string;
    dataContainer: string;
    header: string;
    headerTitle: string;
    hideMenu: string;
    iconContainer: string;
    logo: string;
    logoContainer: string;
    menuBody: string;
    menuDivider: string;
    menuIcon: string;
    menuPosition: string;
    name: string;
    nameContainer: string;
    open: string;
    secondName: string;
    userDropdownItem: string;
    userIcon: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
