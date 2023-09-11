import { spacing } from '../spacing';
import { OverridesThemeOptions } from './types';

export default ({ palette }: OverridesThemeOptions) => ({
  root: {
    borderBottom: 'none',
  },
  head: {
    fontSize: 13,
    color: palette.text.secondary,
    fontWeight: 400,
  },
  sizeSmall: {
    padding: spacing(0.75, 2, 0.75, 2),
  },
  paddingCheckbox: {
    padding: spacing(0, 0, 0, 1.5),
  },
});
