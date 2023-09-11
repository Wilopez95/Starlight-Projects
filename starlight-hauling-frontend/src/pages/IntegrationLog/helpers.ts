import { Colors } from '@starlightpro/shared-components';

import { AuditAction } from '@root/types';

const colorByAction: Record<AuditAction, Colors> = {
  create: 'secondary',
  modify: 'primary',
  delete: 'alert',
};

export const getColorByAction = (action?: string) => {
  switch (action) {
    case 'info':
      return colorByAction.create;
    case 'warn':
      return colorByAction.modify;
    case 'error':
      return colorByAction.delete;
    default:
      return colorByAction.create;
  }
};
