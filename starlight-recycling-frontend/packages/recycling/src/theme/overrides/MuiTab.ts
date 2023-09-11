import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { breakpoints } from '../breakpoints';
import { spacing } from '../spacing';

export const MuiTab: Partial<StyleRules<ComponentNameToClassKey['MuiTab']>> = {
  root: {
    [breakpoints.up('sm')]: {
      minWidth: 90,
    },
    fontWeight: 400,
    textTransform: 'none',
    padding: spacing(2),
  },
};
