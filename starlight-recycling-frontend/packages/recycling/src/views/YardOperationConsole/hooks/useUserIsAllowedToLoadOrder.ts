import { useProtected } from '@starlightpro/common';

export const useUserIsAllowedToLoadOrder = () => {
  return useProtected({ permissions: ['recycling:Order:load', 'recycling:YardConsole:perform'] });
};
