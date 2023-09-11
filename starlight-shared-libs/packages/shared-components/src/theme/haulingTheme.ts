import { ITheme } from './types';

const theme: ITheme = {
  colors: {
    default: {
      standard: '#000',
      dark: '#212b36',
      light: '#7a8086',
      desaturated: '#2b3949',
    },
    white: {
      standard: '#fff',
      desaturated: '#edf0f4',
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
    purple: {
      standard: '#8551b7',
      dark: '#673c93',
      light: '#f1d8fc',
      desaturated: '#fcf5ff',
    },
  },
  offsets: {
    '0': '0',
    '0.5': '0.5rem',
    '1': '1rem',
    '1.5': '1.5rem',
    '2': '2rem',
    '2.5': '2.5rem',
    '3': '3rem',
    '3.5': '3.5rem',
    '4': '4rem',
    '4.5': '4.5rem',
    '5': '5rem',
    '7.5': '7.5rem',
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
    quickView: 3,
    control: 10,
    overlay: 100,
  },
  shadows: {
    default: '0 -2px 8px 0 #c4cdd5',
    sideBar: 'inset 0px -1px 0px #dfe3e8, inset 2px 0px 0px #e87900, inset 0px 1px 0px #dfe3e8',
    light: '0 0 2px 0 #c4cdd5',
    quickView: '-5px -5px 8px 0 rgba(33, 43, 54, 0.2)',
    lobbyMenu:
      'rgb(0 0 0 / 20%) 0px 8px 10px -5px, rgb(0 0 0 / 14%) 0px 16px 24px 2px, rgb(0 0 0 / 12%) 0px 6px 30px 5px',
  },
  sizes: {
    headerHeight: '94px',
    navigationPanelWidth: '264px',
  },
};

export default theme;
