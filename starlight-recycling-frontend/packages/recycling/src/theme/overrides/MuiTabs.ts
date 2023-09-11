import { OverridesThemeOptions } from './types';

export default ({ palette }: OverridesThemeOptions) => ({
  root: {
    minHeight: '58px',
  },
  scroller: {},
  flexContainer: {
    borderBottom: `2px solid ${palette.grey[300]}`,
  },
});
