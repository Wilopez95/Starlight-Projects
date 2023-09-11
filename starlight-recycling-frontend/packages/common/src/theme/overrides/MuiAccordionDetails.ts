import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { spacing } from '../spacing';

export const MuiAccordionDetails: Partial<StyleRules<
  ComponentNameToClassKey['MuiAccordionDetails']
>> = {
  root: {
    padding: spacing(3, 2),
  },
};
