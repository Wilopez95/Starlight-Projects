import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { OverridesThemeOptions } from './types';

export const MuiRadio = ({
  palette,
}: OverridesThemeOptions): Partial<StyleRules<ComponentNameToClassKey['MuiRadio']>> => ({
  root: {
    display: 'inline',
    '& + .MuiFormControlLabel-label': {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.43,
      color: palette.text.secondary,
    },
  },
});
