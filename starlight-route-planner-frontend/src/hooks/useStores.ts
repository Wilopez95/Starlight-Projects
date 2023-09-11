import { useContext } from 'react';

import { StoreContext } from '@root/providers/StoreProvider/StoreProvider';
import type GlobalStore from '@root/stores/GlobalStore';

export const useStores = () => useContext(StoreContext) as GlobalStore;
