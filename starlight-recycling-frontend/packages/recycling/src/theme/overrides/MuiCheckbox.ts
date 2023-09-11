import { OverridesThemeOptions } from './types';

export default ({ palette }: OverridesThemeOptions) => ({
  colorPrimary: {
    color: palette.primary.main,
  },
});
