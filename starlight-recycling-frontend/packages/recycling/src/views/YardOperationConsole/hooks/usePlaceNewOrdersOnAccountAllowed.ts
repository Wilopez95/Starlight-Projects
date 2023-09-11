import { useProtected } from '@starlightpro/common';

export const usePlaceNewOrdersOnAccountAllowed = () => {
  return useProtected({ permissions: ['orders:new-on-account-on-hold-order:full-access'] });
};
