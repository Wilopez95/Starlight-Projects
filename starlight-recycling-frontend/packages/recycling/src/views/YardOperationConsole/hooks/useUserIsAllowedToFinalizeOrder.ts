import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToFinalizeOrder = () => {
  return useProtected({ permissions: ['recycling:Order:finalize'] });
};
