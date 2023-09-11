import { createContext, useContext } from 'react';
import { noop } from 'lodash-es';

import { IUnsavedChangesModalContext } from './types';

export const unsavedChangesContext = createContext<IUnsavedChangesModalContext>({
  isOpen: false,
  isDirtyRef: null,
  confirm: noop,
  close: noop,
});

export const useUnsavedChangesContext = () => {
  return useContext(unsavedChangesContext);
};
