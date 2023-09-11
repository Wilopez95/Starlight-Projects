import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToPaymentOrder = () => {
  return useProtected({
    permissions: ['recycling:Order:payment', 'recycling:YardConsole:perform'],
  });
};
