// COPY & PASTE from mui-datatables
// modified

import { makeStyles } from '@material-ui/core/styles';
import { TableHead as MuiTableHead } from '@material-ui/core';
import clsx from 'clsx';
import React, { useState } from 'react';
import TableHeadCell from './TableHeadCell';
import { MUIDataTableHead, TableSelectCell, TableHeadRow, Responsive } from 'mui-datatables';

const useStyles = makeStyles(
  (theme) => ({
    main: {},
    responsiveStacked: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    responsiveStackedAlways: {
      display: 'none',
    },
    responsiveSimple: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
  }),
  { name: 'MUIDataTableHead' },
);

const TableHead: React.FC<
  MUIDataTableHead & {
    components: Record<string, React.ReactNode>;
    sortOrder: { name: string; directions: 'asc' | 'desc' };
    tableId: string;
  }
> = ({
  columnOrder = null,
  columns,
  components = {},
  count,
  data,
  draggableHeadCellRefs,
  expandedRows,
  options = {},
  selectedRows,
  selectRowUpdate,
  setCellRef,
  sortOrder = {},
  tableRef,
  tableId,
  timers,
  toggleAllExpandableRows,
  toggleSort,
  updateColumnOrder,
}) => {
  const classes = useStyles();

  if (columnOrder === null) {
    columnOrder = columns ? columns.map((item, idx) => idx) : [];
  }

  const [dragging, setDragging] = useState(false);

  const handleToggleColumn = (index: number) => {
    // @ts-ignore
    toggleSort(index);
  };

  const handleRowSelect = () => {
    // @ts-ignore
    selectRowUpdate('head', null);
  };

  const numSelected = (selectedRows && selectedRows.data.length) || 0;
  let isIndeterminate = numSelected > 0 && numSelected < count!;
  let isChecked = numSelected > 0 && numSelected >= count!;

  // When the disableToolbarSelect option is true, there can be
  // selected items that aren't visible, so we need to be more
  // precise when determining if the head checkbox should be checked.
  if (
    options!.disableToolbarSelect === true ||
    options!.selectToolbarPlacement === 'none' ||
    options!.selectToolbarPlacement === 'above'
  ) {
    if (isChecked) {
      for (let ii = 0; ii < data!.length; ii++) {
        if (!selectedRows?.lookup[data![ii].dataIndex]) {
          isChecked = false;
          isIndeterminate = true;
          break;
        }
      }
    } else {
      if (numSelected > count!) {
        isIndeterminate = true;
      }
    }
  }

  let orderedColumns = columnOrder.map((colIndex, idx) => {
    return {
      column: columns![colIndex],
      index: colIndex,
      colPos: idx,
    };
  });

  return (
    <MuiTableHead
      className={clsx({
        [classes.responsiveStacked]: ([
          'vertical',
          'stacked',
          'stackedFullWidth',
        ] as Responsive[]).some((r) => r === options.responsive),
        [classes.responsiveStackedAlways]: options.responsive === ('verticalAlways' as Responsive),
        [classes.responsiveSimple]: options!.responsive === 'simple',
        [classes.main]: true,
      })}
    >
      <TableHeadRow>
        <TableSelectCell
          // @ts-ignore: Property 'setHeadCellRef' does not exist on type 'IntrinsicAttributes & MUIDataTableSelectCell & { children?: ReactNode; }
          setHeadCellRef={setCellRef}
          onChange={handleRowSelect.bind(null)}
          indeterminate={isIndeterminate}
          checked={isChecked}
          isHeaderCell={true}
          expandedRows={expandedRows}
          expandableRowsHeader={options.expandableRowsHeader}
          expandableOn={options.expandableRows}
          selectableOn={options.selectableRows as any}
          fixedHeader={options.fixedHeader!}
          fixedSelectColumn={options.fixedSelectColumn}
          selectableRowsHeader={options.selectableRowsHeader}
          selectableRowsHideCheckboxes={options.selectableRowsHideCheckboxes}
          onExpand={toggleAllExpandableRows}
          isRowSelectable={true}
          components={components}
        />
        {orderedColumns.map(
          ({ column, index, colPos }) =>
            // @ts-ignore
            column.display === 'true' &&
            // @ts-ignore
            (column.customHeadRender ? (
              // @ts-ignore
              column.customHeadRender({ index, ...column }, handleToggleColumn, sortOrder)
            ) : (
              <TableHeadCell
                cellHeaderProps={
                  // @ts-ignore
                  columns[index].setCellHeaderProps
                    ? // @ts-ignore
                      columns[index].setCellHeaderProps({ index, ...column }) || {}
                    : {}
                }
                key={index}
                index={index}
                colPosition={colPos}
                type={'cell'}
                setCellRef={setCellRef}
                // @ts-ignore
                sort={column.sort}
                // @ts-ignore
                sortDirection={column.name === sortOrder.name ? sortOrder.direction : 'none'}
                toggleSort={handleToggleColumn}
                // @ts-ignore
                hint={column.hint}
                // @ts-ignore
                print={column.print}
                options={options}
                column={column}
                columns={columns!}
                updateColumnOrder={updateColumnOrder}
                // @ts-ignore
                columnOrder={columnOrder}
                timers={timers}
                draggingHook={[dragging, setDragging]}
                draggableHeadCellRefs={draggableHeadCellRefs}
                tableRef={tableRef}
                tableId={tableId}
                components={components}
              >
                {
                  // @ts-ignore
                  column.customHeadLabelRender
                    ? // @ts-ignore
                      column.customHeadLabelRender({ index, colPos, ...column })
                    : // @ts-ignore
                      column.label
                }
              </TableHeadCell>
            )),
        )}
      </TableHeadRow>
    </MuiTableHead>
  );
};

export default TableHead;
