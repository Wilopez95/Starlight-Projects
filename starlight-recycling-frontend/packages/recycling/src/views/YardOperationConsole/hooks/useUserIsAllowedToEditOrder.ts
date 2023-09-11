import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToEditOrder = () => {
  return useProtected({ permissions: ['recycling:Order:update', 'recycling:SelfService:update'] });
};
