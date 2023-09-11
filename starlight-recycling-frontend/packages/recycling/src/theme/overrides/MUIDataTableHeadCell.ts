import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { OverridesThemeOptions } from './types';

export const MUIDataTableHeadCell = ({
  palette,
}: OverridesThemeOptions): Partial<
  StyleRules<ComponentNameToClassKey['MUIDataTableHeadCell']>
> => ({
  toolButton: {
    border: '2px solid transparent',

    '&:focus-visible': {
      border: `2px solid ${palette.orange}`,
      outline: 'unset',
    },
  },
  sortAction: {
    alignItems: 'center',
  },
  data: {
    fontSize: 14,
    fontWeight: 400,
    color: palette.text.secondary,
  },
  sortActive: {
    color: palette.text.primary,
  },
});
