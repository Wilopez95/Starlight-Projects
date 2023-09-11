declare namespace StylesScssNamespace {
  export interface IStylesScss {
    areaExplanationList: string;
    areaExplanationListItem: string;
    areaNoticeMark: string;
    boundaryLabel: string;
    controlsOverlay: string;
    controlsWrapper: string;
    mapHintContent: string;
    mapHintOverlay: string;
    selectWrapper: string;
  }
}

declare const StylesScssModule: StylesScssNamespace.IStylesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesScssNamespace.IStylesScss;
};

export = StylesScssModule;
