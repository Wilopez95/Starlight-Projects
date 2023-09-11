import { createContext, useContext } from 'react';

export interface ITableScrollContext {
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const TableScrollContext = createContext<ITableScrollContext>({
  scrollContainerRef: { current: null },
});

export const useTableScrollContext = () => useContext(TableScrollContext);
