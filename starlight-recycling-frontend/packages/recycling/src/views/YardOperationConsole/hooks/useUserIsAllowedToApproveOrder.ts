import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToApproveOrder = () => {
  return useProtected({ permissions: ['recycling:Order:approve', 'recycling:Order:full-access'] });
};
