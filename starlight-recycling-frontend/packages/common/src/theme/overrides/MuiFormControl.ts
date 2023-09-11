import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { spacing } from '../spacing';

export const MuiFormControl: Partial<StyleRules<ComponentNameToClassKey['MuiFormControl']>> = {
  root: {
    marginBottom: spacing(2),
    justifyContent: 'flex-start',
  },
};
