import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToInvoiceOrder = () => {
  return useProtected({ permissions: ['recycling:Order:invoice'] });
};
