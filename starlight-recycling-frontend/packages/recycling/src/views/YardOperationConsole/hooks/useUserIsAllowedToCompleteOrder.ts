import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToCompleteOrder = () => {
  return useProtected({
    permissions: ['recycling:Order:complete', 'recycling:YardConsole:perform'],
  });
};
