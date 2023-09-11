declare namespace StylesScssNamespace {
  export interface IStylesScss {
    content: string;
    control: string;
    controls: string;
    heading: string;
    label: string;
    page: string;
    phoneLink: string;
    profileInfoTable: string;
    profileWrapper: string;
    sectionHeading: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
