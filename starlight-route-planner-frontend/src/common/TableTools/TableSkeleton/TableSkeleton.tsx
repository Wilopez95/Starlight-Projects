import React, { memo } from 'react';
import { BurgerIcon, Loadable } from '@starlightpro/shared-components';
import { range } from 'lodash-es';

import { TableCell } from '../TableCell';
import { TableRow } from '../TableRow/TableRow';

export const TableSkeleton: React.FC<ITableSkeleton> = memo(({ cells, burger, rows = 15 }) => {
  const loadableCells = range(cells).map(index => (
    <TableCell key={index}>
      <Loadable />
    </TableCell>
  ));

  if (burger) {
    loadableCells.push(
      <TableCell right key={cells + 2}>
        <BurgerIcon />
      </TableCell>,
    );
  }

  return (
    <>
      {range(rows).map(index => (
        <TableRow key={index}>{loadableCells}</TableRow>
      ))}
    </>
  );
});

interface ITableSkeleton {
  cells: number;
  rows?: number;
  burger?: boolean;
}
