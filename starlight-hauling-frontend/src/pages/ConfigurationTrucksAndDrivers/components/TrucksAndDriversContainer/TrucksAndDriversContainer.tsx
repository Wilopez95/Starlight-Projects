import React, { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

import { AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface ITrucksAndDriversContext {
  ref: React.RefObject<HTMLDivElement> | null;
  search?: string;
  filterState?: AppliedFilterState;
}

export const TrucksAndDriversContext = createContext<ITrucksAndDriversContext>({
  ref: null,
  search: '',
});

type Props = {
  children: React.ReactNode;
};

export const TrucksAndDriversContainer: React.FC<Props> = ({ children }) => {
  const { ref: container } = useContext(TrucksAndDriversContext);

  if (!container?.current) {
    return null;
  }

  return createPortal(children, container.current, 'trucks-and-drivers-buttons');
};
