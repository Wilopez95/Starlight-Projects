// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Palette, PaletteOptions, TypeBackground } from '@material-ui/core/styles/createPalette';

declare module '@material-ui/core/styles/createPalette' {
  interface TypeBackground {
    errorLight: string;
  }

  export interface Palette {
    background: TypeBackground;
    blue: string;
    blueBackground: string;
    orange: string;
    orangeLight: string;
    orangeBackground: string;
    yellow: string;
    lightBlue: string;
    lightBlueBackground: string;
    coreMain300: string;
    coreGreenSumbit?: string;
    coreRedHover?: string;
    border?: {
      hover: string;
    };
  }

  export interface PaletteOptions {
    background: Partial<TypeBackground>;
    blue: string;
    blueBackground: string;
    orange: string;
    orangeLight: string;
    orangeBackground: string;
    yellow: string;
    lightBlue: string;
    lightBlueBackground: string;
    coreMain300: string;
    coreGreenSumbit?: string;
    coreRedHover?: string;
    border?: {
      hover: string;
    };
  }
}
