import React, { useCallback } from 'react';
import { ArrowIcon } from '@starlightpro/shared-components';
import cx from 'classnames';

import cellStyles from '../TableCell/css/styles.scss';
import { ITableSortableHeadCell } from './types';

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
    <th
      style={{
        width,
        height,
      }}
      onClick={handleSort}
      className={cx({ [styles.sortable]: !!onSort, [cellStyles.full]: full })}
    >
      <div className={className}>
        {titleClassName ? <div className={titleClassName}>{children}</div> : children}

        {sortKey && (
          <ArrowIcon
            className={cx(styles.arrow, {
              [styles.sortDesc]: sortKey === currentSortBy && sortOrder === 'desc',
              [styles.sortAsc]: sortKey === currentSortBy && sortOrder === 'asc',
              [styles.hidden]: sortKey !== currentSortBy,
            })}
          />
        )}
      </div>
    </th>
  );
};
