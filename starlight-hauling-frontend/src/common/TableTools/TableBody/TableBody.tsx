import React, { forwardRef } from 'react';

import { TableRowNoResult } from '../TableRowNoResult';
import { useTableScrollContext } from '../TableScrollContainer/context';
import { TableSkeleton } from '../TableSkeleton/TableSkeleton';

import { ITableBody } from './types';

export const TableBody = forwardRef<HTMLTableSectionElement, ITableBody>(
  ({ cells, loading, children, className, noResult, rows }, ref) => {
    let content = children;

    const tableScrollContext = useTableScrollContext();

    if (loading && React.Children.count(children) === 0) {
      if (tableScrollContext?.scrollContainerRef.current) {
        tableScrollContext.scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      }
      content = <TableSkeleton cells={cells} rows={rows} />;
    } else if (noResult) {
      content = <TableRowNoResult />;
    }

    return (
      <tbody className={className} ref={ref}>
        {content}
      </tbody>
    );
  },
);
