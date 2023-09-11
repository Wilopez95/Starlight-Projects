import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToInYardOrder = () => {
  return useProtected({ permissions: ['recycling:Order:inyard'] });
};
