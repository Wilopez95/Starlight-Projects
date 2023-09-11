import { createMuiTheme } from '@material-ui/core/styles';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';

export const paletteOption: PaletteOptions = {
  primary: {
    light: '#ccebdd',
    main: '#04ae64',
    dark: '#03633a',
    contrastText: '#fff',
  },
  secondary: {
    light: '#fa9a88',
    main: '#de3618',
    dark: '#bf1d08',
    contrastText: '#fff',
  },
  grey: {
    // paleGrey
    50: '#f9fafb',
    100: '#f4f6f8',
    // pale-grey-two
    200: '#dfe3e8',
    300: '#c4cdd5',
    400: '#bcbfc2',
    500: '#919eab',
    600: '#637381',
    700: '#798086',
    // charcoal grey
    800: '#454647',
    900: '#2e2f30',
  },
  background: {
    default: '#f9fafb',
    errorLight: '#fbeae5',
  },
  success: {
    light: '#e4ffec',
    main: '#04ae64',
  },
  error: {
    main: '#de3618',
    light: '#ff0229',
    dark: '#bf1d08',
  },
  common: {
    white: '#fff',
  },
  text: {
    primary: '#212b36',
    secondary: 'rgba(33, 43, 54, 0.6)',
  },
  blue: '#006fbb',
  blueBackground: '#ebf5fa',
  orange: '#e87900',
  orangeLight: 'rgba(232, 121, 0, 0.1)',
  orangeBackground: '#fcebd9',
  yellow: '#fcf6d9',
  lightBlue: '#00848e',
  lightBlueBackground: '#e0f5f5',
  coreMain300: '#e27900',
  coreGreenSumbit: '#04ae64',
  coreRedHover: '#109159',
};

export const { palette } = createMuiTheme({
  palette: paletteOption,
});
