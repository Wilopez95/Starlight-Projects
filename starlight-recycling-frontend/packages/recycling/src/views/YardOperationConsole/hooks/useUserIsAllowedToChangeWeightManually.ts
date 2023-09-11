import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToChangeWeightManually = () => {
  return useProtected({ permissions: ['recycling:OverrideScalesWeight:full-access'] });
};
