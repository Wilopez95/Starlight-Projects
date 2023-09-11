import React, { forwardRef } from 'react';

import { TableRowNoResult } from '../TableRowNoResult';
import { TableSkeleton } from '../TableSkeleton/TableSkeleton';

export const TableBody = forwardRef<HTMLTableSectionElement, ITableBody>(
  ({ cells, loading, children, className, noResult, burger, rows }, ref) => {
    let content = children;

    if (loading && React.Children.count(children) === 0) {
      content = <TableSkeleton cells={cells} burger={burger} rows={rows} />;
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

interface ITableBody {
  cells: number;
  children: React.ReactNode;
  loading?: boolean;
  rows?: number;
  className?: string;
  noResult?: boolean;
  burger?: boolean;
}
