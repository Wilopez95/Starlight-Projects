import { Colors } from '@starlightpro/shared-components';

import { AuditAction } from '@root/types';

const colorByAction: Record<AuditAction, Colors> = {
  create: 'success',
  modify: 'grey',
  delete: 'alert',
};

export const getColorByAction = (action: AuditAction) => {
  return colorByAction[action];
};
