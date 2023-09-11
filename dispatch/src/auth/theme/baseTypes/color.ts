export interface IThemeShade {
  dark: string;
  light: string;
  desaturated: string;
}

export interface IThemeColor extends Partial<IThemeShade> {
  standard: string;
}

export interface IThemeColors {
  default: IThemeColor;
  white: IThemeColor;
  primary: IThemeColor;
  secondary: IThemeColor;
  success: IThemeColor;
  information: IThemeColor;
  alert: IThemeColor;
  grey: IThemeColor;
  alternative: IThemeColor;
}

export type Colors = keyof IThemeColors;
