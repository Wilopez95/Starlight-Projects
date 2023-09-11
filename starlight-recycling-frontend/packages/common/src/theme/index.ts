import { createMuiTheme, responsiveFontSizes, fade } from '@material-ui/core/styles';

import { palette } from './palette';
import breakpoints from './breakpoints';
import spacingInput, { spacing } from './spacing';
import typography from './typography';
import overrides from './overrides';

const theme = createMuiTheme({
  palette,
  typography,
  overrides,
  breakpoints,
  spacing: spacingInput,
  appDrawer: {
    width: 264,
  },
  appHeader: {
    height: 92,
  },
  sidebarMenu: {
    color: palette.grey[50],
    iconColor: palette.common.white,
  },
  shape: {
    borderRadius: 3,
  },
  labelComponent: {
    root: {
      borderRadius: 2,
      padding: spacing(1 / 4, 1 / 2),
    },
    active: {
      color: palette.primary.main,
      backgroundColor: fade(palette.primary.main, 0.1),
    },
    inactive: {
      color: palette.secondary.main,
      backgroundColor: fade(palette.secondary.main, 0.1),
    },
  },
  scale: {
    colors: [
      palette.secondary.main,
      palette.orange,
      palette.primary.main,
      palette.orange,
      palette.secondary.main,
    ],
  },
  map: {
    mapStyle: 'mapbox://styles/mapbox/streets-v11',
    defaultZoom: 3.75,
    boundary: {
      fillColor: fade(palette.primary.main, 0.15),
      outlineColor: palette.primary.main,
      outlineWidth: 2,
    },
  },
});

export default responsiveFontSizes(theme, { breakpoints: [] });
