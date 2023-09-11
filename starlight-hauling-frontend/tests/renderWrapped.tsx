import React from 'react';
import { queries, render as rtlRender } from '@testing-library/react';

import { StoreContext } from '@root/components/StoreProvider/StoreProvider';

import * as customQueries from './queries';
import { CustomQueries, ICustomRenderOptions } from './types';

export const renderWrapped = (
  ui: React.ReactElement,
  { globalStore, ...renderOptions }: ICustomRenderOptions<CustomQueries> = {},
) => {
  const Wrapper: React.FC = ({ children }) => (
    <StoreContext.Provider value={globalStore}>{children}</StoreContext.Provider>
  );

  return rtlRender<CustomQueries>(ui, {
    queries: { ...queries, ...customQueries },
    wrapper: Wrapper,
    ...renderOptions,
  });
};
