import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToOverrideCreditLimit = () => {
  return useProtected({ permissions: ['orders:override-credit-limit:perform'] });
};
