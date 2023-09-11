import React, { forwardRef, useMemo, useRef } from 'react';

import { ITableScrollContext, TableScrollContext } from './context';
import * as Styles from './styles';
import { ITableScrollContainer } from './types';

// TODO: @dboryn remove pls this after new quick view implementation
const TableScrollContainer: React.ForwardRefRenderFunction<
  HTMLDivElement,
  ITableScrollContainer
> = ({ children, className, scrollClassName, tableNavigation }, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contextValue: ITableScrollContext = useMemo(
    () => ({
      scrollContainerRef,
    }),
    [],
  );

  return (
    <TableScrollContext.Provider value={contextValue}>
      <Styles.Container ref={ref} className={className}>
        {tableNavigation}
        <Styles.TableScroll
          className={scrollClassName}
          overflowY="scroll"
          ref={scrollContainerRef}
          overflowX="auto"
        >
          {children}
        </Styles.TableScroll>
      </Styles.Container>
    </TableScrollContext.Provider>
  );
};

export default forwardRef(TableScrollContainer);
