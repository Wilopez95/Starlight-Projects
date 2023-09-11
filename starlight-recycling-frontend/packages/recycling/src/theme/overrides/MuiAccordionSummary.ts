import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';

import { spacing } from '../spacing';
import { OverridesThemeOptions } from './types';

export const MuiAccordionSummary = ({
  palette,
}: OverridesThemeOptions): Partial<StyleRules<ComponentNameToClassKey['MuiAccordionSummary']>> => ({
  root: {
    background: palette.grey[50],

    '&$expanded': {
      minHeight: '48px',
    },
  },
  content: {
    '&$expanded': {
      margin: spacing(1.5, 0),
    },
  },
  expanded: {},
});
