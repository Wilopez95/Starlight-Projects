import { createMuiTheme, responsiveFontSizes, fade } from '@material-ui/core/styles';

import { palette } from './palette';
import breakpoints from './breakpoints';
import spacingInput from './spacing';
import typography from './typography';
import overrides from './overrides';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

export { createMuiTheme as createRecyclingTheme, fade };

export const recyclingThemeOption: ThemeOptions = {
  palette,
  typography,
  overrides: overrides({ palette }),
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
};

export const theme = createMuiTheme(recyclingThemeOption);

export default responsiveFontSizes(theme);
