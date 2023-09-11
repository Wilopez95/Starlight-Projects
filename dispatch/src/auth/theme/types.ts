import {
  IThemeColors,
  ThemeFontWeights,
  ThemeOffsets,
  ThemeShadows,
  ThemeZIndexes,
} from './baseTypes';

export interface ITheme {
  colors: IThemeColors;
  offsets: ThemeOffsets;
  fontWeights: ThemeFontWeights;
  zIndexes: ThemeZIndexes;
  shadows: ThemeShadows;
}
