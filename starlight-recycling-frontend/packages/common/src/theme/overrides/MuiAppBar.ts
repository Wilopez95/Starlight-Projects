import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { palette } from '../palette';

export const MuiAppBar: Partial<StyleRules<ComponentNameToClassKey['MuiAppBar']>> = {
  colorDefault: {
    backgroundColor: palette.grey[800],
    color: palette.getContrastText(palette.grey[800]),
  },
};
