import { useContext } from 'react';

import { UserContext } from '@root/auth/providers/UserProvider/UserProvider';

export const useUserContext = () => {
  return useContext(UserContext);
};
