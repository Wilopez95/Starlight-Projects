import { useContext } from 'react';

import { UserContext } from '@root/components/UserProvider/UserProvider';

export const useUserContext = () => useContext(UserContext);
