import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToEditNonServiceOrder = () => {
  return useProtected({ permissions: ['recycling:NonServiceOrder:update'] });
};
