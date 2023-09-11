import React, { useCallback } from 'react';
import { Typography } from '@starlightpro/shared-components';
import cx from 'classnames';

import * as Styles from './styles';
import { ITableSortableHeadCell } from './types';

import cellStyles from '../TableCell/css/styles.scss';
import styles from './css/styles.scss';

export const TableSortableHeadCell: React.FC<ITableSortableHeadCell> = ({
  children,
  width,
  right,
  center,
  height,
  titleClassName,
  tableRef,
  onSort,
  sortKey,
  sortOrder,
  currentSortBy,
  full = false,
}) => {
  const className = cx(cellStyles.cell, {
    [cellStyles.right]: right,
    [cellStyles.center]: center,
    [styles.sortableContainer]: !!onSort,
  });

  const handleSort = useCallback(() => {
    if (currentSortBy !== sortKey) {
      onSort(sortKey, 'desc');

      return;
    }

    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }

    onSort(sortKey, sortOrder === 'desc' ? 'asc' : 'desc');
  }, [currentSortBy, onSort, sortKey, sortOrder, tableRef]);

  return (
    <Styles.SortableHeaderCellStyled
      width={width}
      height={height}
      sortable={!!onSort}
      full={full}
      onClick={handleSort}
    >
      <div className={className}>
        <Typography variant='bodyMedium' color='secondary' shade='light' className={titleClassName}>
          {children}
        </Typography>

        <Styles.ArrowStyled
          desc={sortKey === currentSortBy && sortOrder === 'desc' ? 1 : 0}
          asc={sortKey === currentSortBy && sortOrder === 'asc' ? 1 : 0}
          hidden={sortKey !== currentSortBy}
        />
      </div>
    </Styles.SortableHeaderCellStyled>
  );
};
