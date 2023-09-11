import React, { createContext, useRef } from 'react';
import { runInAction } from 'mobx';

import GlobalStore from '@root/stores/GlobalStore';

export const StoreContext = createContext<GlobalStore | undefined>(undefined);

const createGlobalStore = () => runInAction(() => new GlobalStore());

const StoreProvider: React.FC = ({ children }) => {
  const globalStore = useRef<GlobalStore>(createGlobalStore());

  return <StoreContext.Provider value={globalStore.current}>{children}</StoreContext.Provider>;
};

export default StoreProvider;
