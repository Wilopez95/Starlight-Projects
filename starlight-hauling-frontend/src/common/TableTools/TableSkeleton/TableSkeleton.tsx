import React, { memo } from 'react';
import { range } from 'lodash-es';

import { Loadable } from '@root/common/Loadable/Loadable';

import { TableCell } from '../TableCell';
import { TableRow } from '../TableRow/TableRow';

import { ITableSkeleton } from './types';

export const TableSkeleton: React.FC<ITableSkeleton> = memo(({ cells, rows = 15 }) => {
  const loadableCells = range(cells).map(index => (
    <TableCell key={index}>
      <Loadable />
    </TableCell>
  ));

  return (
    <>
      {range(rows).map(index => (
        <TableRow key={index}>{loadableCells}</TableRow>
      ))}
    </>
  );
});
