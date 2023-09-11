import { type FunctionComponent } from 'react';
import { createRecyclingTheme, recyclingThemeOption } from '@starlightpro/recycling/theme';
import overrides from '@starlightpro/recycling/theme/overrides';
import { paletteOption } from '@starlightpro/recycling/theme/palette';
import { merge } from 'lodash-es';

import { ArrowStyled } from '@root/common/TableTools/TableHeaderCell/TableSortableHeaderCell/styles';

const { palette } = createRecyclingTheme({
  palette: {
    ...paletteOption,
    primary: {
      light: '#f5a623',
      main: '#e87900',
      dark: '#c5500f',
      contrastText: '#fcebd9',
    },
    secondary: {
      light: '#637381',
      main: '#2b3949',
      dark: '#212b36',
      contrastText: '#919eab',
    },
    success: {
      light: '#67cba0',
      main: '#04ae64',
      dark: '#109159',
      contrastText: '#e4ffec',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    border: {
      hover: '#e87900',
    },
  },
});

const overridesConfig = merge(overrides({ palette }), {
  MuiButton: {
    root: {
      boxShadow: 'unset',
      border: '1px solid transparent',
    },
    containedPrimary: {
      color: palette.common.white,
    },
    contained: {
      boxShadow: 'unset',

      '&:hover': {
        boxShadow: 'unset',
      },

      '&:focus-visible': {
        boxShadow: 'unset',
        outline: `2px solid ${palette.primary.main}`,
        border: `1px solid ${palette.primary.dark}`,
      },
    },
    text: {
      fontWeight: 400,
    },
    outlined: {
      '&:hover': {
        background: palette.primary.contrastText,
        borderColor: palette.primary.main,
      },
    },
  },
  MuiSwitch: {
    root: {
      width: 48,
      height: 35,
    },
    thumb: {
      width: 17,
      height: 17,
    },
    switchBase: {
      '&:hover': {
        backgroundColor: 'unset',
      },

      '&.Mui-checked': {
        transform: 'translateX(13px)',
      },
    },
  },
  MUIDataTableHeadRow: {
    root: {
      '&:hover': {
        backgroundColor: 'unset',
      },
      '&.Mui-selected, &.Mui-selected:hover': {
        backgroundColor: 'unset',
      },
      boxShadow: `0 2px 0 0 ${palette.grey[200]}`,
    },
  },
  MUIDataTableHeadCell: {
    root: {
      padding: 0,

      '& > div': {
        display: 'block',
        margin: '9px 24px',
        width: 'auto',
        color: palette.secondary.light,
        fontSize: '1.75rem',
      },
    },
    contentWrapper: {
      width: '100%',
      display: 'block',
    },
    toolButton: {
      padding: '8px 0',
      marginLeft: '0',
      marginRight: '0',
      width: '100%',
      '&:hover': {
        backgroundColor: 'unset',
      },
      display: 'flex',
      justifyContent: 'flex-start',

      '& .MuiButton-label': {
        display: 'block',
        margin: '9px 24px',
        width: 'auto',
        color: palette.secondary.light,
        fontSize: '1.75rem',
      },
    },
  },
  MuiTab: {
    root: {
      '&:focus-visible': {
        outlineOffset: '-2px',
      },
    },
  },
  MuiCheckbox: {
    root: {
      '&.Mui-focusVisible': {
        outline: `2px solid ${palette.primary.main}`,
      },
    },
  },
  MuiTableSortLabel: {
    root: {
      marginLeft: 8,
    },
    icon: {
      marginRight: 0,
    },
  },
  MUIDataTableBodyRow: {
    root: {
      transition: 'background-color 300ms ease-in-out',
      cursor: 'pointer',
      padding: '0 16px',
      width: '100%',
      height: 61,
    },
    '&:hover': {
      backgroundColor: palette.grey[50],
    },
  },
  MUIDataTableBodyCell: {
    root: {
      padding: 0,

      '&:not(.datatables-noprint)>div': {
        textAlign: 'left',
        margin: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textTransform: 'capitalize',
      },
    },
  },
  MuiIconButton: {
    root: {
      '& .MuiIconButton-label': {
        '& .MuiSvgIcon-root': {
          fontSize: '3rem !important',
        },
      },
    },
  },
});

const typography = merge(recyclingThemeOption.typography, {
  h1: {
    fontSize: 28,
    lineHeight: '5.5rem',
    fontWeight: 600,
  },
});

export const theme = createRecyclingTheme({
  ...recyclingThemeOption,
  overrides: {
    ...overridesConfig,
  },
  props: {
    MuiTableSortLabel: {
      IconComponent: ArrowStyled as unknown as FunctionComponent,
    },
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette,
  typography,
});
