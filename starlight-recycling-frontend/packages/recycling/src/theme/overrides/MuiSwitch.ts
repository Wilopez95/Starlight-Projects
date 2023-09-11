import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { OverridesThemeOptions } from './types';

export const MuiSwitch = ({
  palette,
}: OverridesThemeOptions): Partial<StyleRules<ComponentNameToClassKey['MuiSwitch']>> => ({
  root: {
    padding: '7px',
  },
  track: {
    borderRadius: '18px',
  },
  colorPrimary: {
    '&$checked': {
      color: palette.background.default,
    },
    '&$checked + $track': {
      backgroundColor: palette.primary.main,
    },
  },
  switchBase: {
    '&$checked + $track': {
      opacity: 1,
    },
  },
});
