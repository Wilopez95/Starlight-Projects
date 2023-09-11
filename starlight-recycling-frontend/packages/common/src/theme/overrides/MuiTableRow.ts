import { palette } from '../palette';

export default {
  root: {
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
};
