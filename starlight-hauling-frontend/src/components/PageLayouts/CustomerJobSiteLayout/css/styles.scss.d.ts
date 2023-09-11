declare namespace StylesScssNamespace {
  export interface IStylesScss {
    badge: string;
    buttonSpace: string;
    config: string;
    configLabel: string;
    configLabels: string;
    content: string;
    contentWrapper: string;
    divider: string;
    filterIcon: string;
    fullAddress: string;
    heading: string;
    headingWrapper: string;
    jobSiteNavigationItem: string;
    navigation: string;
    notFound: string;
    page: string;
    plus: string;
    projectFilter: string;
    projectFilterItem: string;
    projectFilterWrapper: string;
    projectOverlay: string;
    scrollContainer: string;
    secondLine: string;
    selected: string;
    title: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
