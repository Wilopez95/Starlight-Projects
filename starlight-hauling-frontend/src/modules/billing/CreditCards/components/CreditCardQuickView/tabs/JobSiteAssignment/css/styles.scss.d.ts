declare namespace StylesScssNamespace {
  export interface IStylesScss {
    assignJobSite: string;
    deleteIcon: string;
    icon: string;
    radioButton: string;
    radioButtonsContainer: string;
    textWithIcon: string;
    withControl: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
