import { Colors } from '@starlightpro/shared-components';

import { RecurrentOrderStatus } from '@root/types';

const colorByStatus: Record<RecurrentOrderStatus, Colors> = {
  active: 'success',
  closed: 'alternative',
  onHold: 'primary',
};

export const getColorByStatus = (status: RecurrentOrderStatus) => {
  return colorByStatus[status];
};

export const getColorByActiveStatus = (active: boolean): Colors => {
  return active ? 'success' : 'primary';
};
