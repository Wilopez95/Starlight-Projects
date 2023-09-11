import React, { useCallback } from 'react';
import { omit } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useTableScrollContext } from '@root/common/TableTools/TableScrollContainer/context';
import { Typography } from '@root/common/Typography/Typography';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { SortType } from '@root/types';

import { ITableSortableHeadCellComponent } from '../types';

import * as Styles from './styles';

const TableSortableHeaderCell = <T extends string>({
  children,
  titleClassName,
  sortKey,
  right,
  center,
  onSort,
  ...props
}: ITableSortableHeadCellComponent<T>) => {
  let currentSortKey: string | undefined;
  let currentSortOrder: SortType;
  let onStoreSortChange: (sortBy: Extract<T, T>, sortOrder: SortType) => void;

  const cellProps = omit(props, [
    'store',
    'currentSortBy',
    'currentSortOrder',
    'onStoreSortChange',
  ]);

  if ('currentSortBy' in props) {
    currentSortKey = props.currentSortBy;
    currentSortOrder = props.currentSortOrder;
    onStoreSortChange = props.onStoreSortChange;
  } else {
    currentSortKey = props.store.sortBy;
    currentSortOrder = props.store.sortOrder;
    onStoreSortChange = props.store.setSort;
  }

  const { scrollContainerRef } = useTableScrollContext();

  const handleSort = useCallback(() => {
    if (currentSortKey !== sortKey) {
      onStoreSortChange(sortKey, 'desc');
      onSort?.();

      return;
    }

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    onStoreSortChange(sortKey, currentSortOrder === 'desc' ? 'asc' : 'desc');
    onSort?.();
  }, [currentSortKey, sortKey, scrollContainerRef, onStoreSortChange, currentSortOrder, onSort]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleSort?.();
      }
    },
    [handleSort],
  );

  return (
    <Styles.SortableHeaderCellStyled
      onClick={handleSort}
      tabIndex={0}
      onKeyUp={handleKeyPress}
      {...cellProps}
    >
      <Styles.SortableCellContainer right={right} center={center}>
        <Typography variant="bodyMedium" color="secondary" shade="light" className={titleClassName}>
          {children}
        </Typography>

        <Styles.ArrowStyled
          $active={sortKey === currentSortKey}
          $desc={currentSortOrder === 'desc'}
          $asc={currentSortOrder === 'asc'}
        />
      </Styles.SortableCellContainer>
    </Styles.SortableHeaderCellStyled>
  );
};

export default observer(TableSortableHeaderCell);
