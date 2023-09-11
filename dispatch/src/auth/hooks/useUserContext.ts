import { useContext } from 'react';
import { UserContext } from '@root/providers/UserProvider/UserProvider';

export const useUserContext = () => {
  return useContext(UserContext);
};
