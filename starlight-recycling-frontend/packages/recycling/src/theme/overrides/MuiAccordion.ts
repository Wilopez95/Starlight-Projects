import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { spacing } from '../spacing';

export const MuiAccordion: Partial<StyleRules<ComponentNameToClassKey['MuiAccordion']>> = {
  root: {
    marginBottom: spacing(1),

    '&:before': {
      display: 'none',
    },
  },
};
