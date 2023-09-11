import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { palette } from '../palette';

export const MuiButton: Partial<StyleRules<ComponentNameToClassKey['MuiButton']>> = {
  root: {
    textTransform: 'none',
  },
  outlined: {
    fontWeight: 400,
  },
  containedPrimary: {
    '&$disabled': {
      color: palette.common.white,
      background: palette.primary.main,
      opacity: 0.3,
    },
  },
};
