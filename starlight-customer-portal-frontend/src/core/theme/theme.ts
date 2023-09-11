import { ITheme } from './types';

const theme: ITheme = {
  colors: {
    default: {
      standard: '#000',
      dark: '#212b36',
      desaturated: '#2b3949',
    },
    white: {
      standard: '#fff',
    },
    primary: {
      standard: '#e87900',
      dark: '#c5500f',
      light: '#f5a623',
      desaturated: '#fcebd9',
    },
    secondary: {
      standard: '#2b3949',
      dark: '#212b36',
      light: '#637381',
      desaturated: '#919eab',
    },
    success: {
      standard: '#04ae64',
      dark: '#109159',
      light: '#67cba0',
      desaturated: '#e4ffec',
    },
    information: {
      standard: '#006fbb',
      dark: '#084e8a',
      light: '#b4e0fa',
      desaturated: '#ebf5fa',
    },
    alert: {
      standard: '#de3618',
      dark: '#bf1d08',
      light: '#fa9a88',
      desaturated: '#fbeae5',
    },
    grey: {
      standard: '#dfe3e8',
      dark: '#c4cdd5',
      light: '#f4f6f8',
      desaturated: '#f9fafb',
    },
    alternative: {
      standard: '#47c1bf',
      dark: '#00848e',
      light: '#b7ecec',
      desaturated: '#e0f5f5',
    },
  },
  offsets: {
    '0': '0',
    '0.5': '0.5rem',
    '1': '1rem',
    '2': '2rem',
    '3': '3rem',
    '4': '4rem',
    '5': '5rem',
    auto: 'auto',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  zIndexes: {
    table: 1,
    modal: 2,
    control: 10,
    overlay: 100,
  },
  shadows: {
    default: '0 -2px 8px 0 #c4cdd5',
    sideBar: 'inset 0px -1px 0px #dfe3e8, inset 2px 0px 0px #e87900, inset 0px 1px 0px #dfe3e8',
    light: '0 0 2px 0 #c4cdd5',
  },
};

export default theme;
