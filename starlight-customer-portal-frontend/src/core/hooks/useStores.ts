import { useContext } from 'react';

import type GlobalStore from '@root/app/GlobalStore';
import { StoreContext } from '@root/app/providers/StoreProvider/StoreProvider';

export const useStores = () => {
  return useContext(StoreContext) as GlobalStore;
};
