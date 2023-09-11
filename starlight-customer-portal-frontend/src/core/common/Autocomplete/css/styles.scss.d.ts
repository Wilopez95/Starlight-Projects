declare namespace StylesScssNamespace {
  export interface IStylesScss {
    autocompleteWrapper: string;
    container: string;
    createButton: string;
    dropdownContainer: string;
    dropdownWrapper: string;
    inputClassName: string;
    inputImageContainer: string;
    itemContainer: string;
    large: string;
    medium: string;
    new: string;
    option: string;
    text: string;
    wrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
