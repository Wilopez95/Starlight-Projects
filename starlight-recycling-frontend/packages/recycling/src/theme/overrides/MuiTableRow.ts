import { OverridesThemeOptions } from './types';

export default ({ palette }: OverridesThemeOptions) => ({
  root: {
    border: '2px solid transparent',

    '&:focus-visible': {
      border: `2px solid ${palette.orange}`,
      outline: 'unset',
    },
    '&:hover': {
      backgroundColor: palette.grey[50],
    },
    '&.Mui-selected, &.Mui-selected:hover': {
      backgroundColor: palette.grey[50],
    },
  },
  head: {
    boxShadow: `0 2px 8px ${palette.grey[200]}`,
  },
});
