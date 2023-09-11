import { IBadge } from '@starlightpro/shared-components';

export type ColorType = 'blue' | 'green' | 'orange' | 'red' | 'grey';

export const statusColor: {
  [key in ColorType]: IBadge;
} = {
  blue: {
    color: 'information',
    shade: 'standard',
    bgColor: 'information',
    bgShade: 'desaturated',
  },
  green: {
    color: 'success',
    shade: 'standard',
    bgColor: 'success',
    bgShade: 'desaturated',
  },
  orange: {
    color: 'primary',
    shade: 'standard',
    bgColor: 'primary',
    bgShade: 'desaturated',
  },
  red: {
    color: 'alert',
    shade: 'standard',
    bgColor: 'alert',
    bgShade: 'desaturated',
  },
  grey: {
    color: 'secondary',
    shade: 'light',
    bgColor: 'grey',
    bgShade: 'light',
  },
};
