import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import HelpIcon from '@material-ui/icons/Help';
import MuiTooltip from '@material-ui/core/Tooltip';
import React, { useState } from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { makeStyles, withTheme } from '@material-ui/core/styles';
import { MUIDataTableColumnDef, MUIDataTableHeadCell } from 'mui-datatables';
import SortArrowIcon from './SortArrowIcon';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

interface ITableHeadCellInternalProps {
  cellHeaderProps: { className: string };
  colPosition: number;
  index: number;
  print: boolean;
  setCellRef: any;
  tableRef: any;
  sortDirection: 'asc' | 'desc' | 'none';
  tableId: string;
  type: string;
  column: MUIDataTableColumnDef;
  columns: MUIDataTableColumnDef[];
  components: Record<string, React.ReactNode>;
  columnOrder: any[];
  draggableHeadCellRefs: any;
  draggingHook: any;
  timers?: object;
  updateColumnOrder?: (...args: any[]) => any;
}

type Props = ITableHeadCellInternalProps & MUIDataTableHeadCell & { theme: Theme };

const useStyles = makeStyles(
  (theme) => ({
    root: {
      padding: 10,
      whiteSpace: 'nowrap',
    },
    fixedHeader: {
      position: 'sticky',
      top: '0px',
      zIndex: 100,
      backgroundColor: theme.palette.background.paper,
    },
    tooltip: {
      cursor: 'pointer',
    },
    mypopper: {
      '&[data-x-out-of-boundaries]': {
        display: 'none',
      },
    },
    data: {
      display: 'inline-block',
      color: theme.palette.grey[400],
    },
    sortAction: {
      display: 'flex',
      cursor: 'pointer',
    },
    dragCursor: {
      cursor: 'grab',
    },
    sortLabelRoot: {
      height: '20px',
      width: '15px',
    },
    sortActive: {
      color: theme.palette.grey[400],
    },
    toolButton: {
      textTransform: 'none',
      minWidth: 0,
    },
    contentWrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    hintIconAlone: {
      marginTop: '-3px',
      marginLeft: '3px',
    },
    hintIconWithSortIcon: {
      marginTop: '-3px',
    },
  }),
  { name: 'MUIDataTableHeadCell' },
);

const TableHeadCell: React.FC<Props> = ({
  cellHeaderProps = {},
  children,
  colPosition,
  column,
  hint,
  index,
  options,
  print,
  setCellRef,
  sort,
  sortDirection,
  tableId,
  toggleSort,
  theme,
}) => {
  const [sortTooltipOpen, setSortTooltipOpen] = useState(false);
  const [hintTooltipOpen, setHintTooltipOpen] = useState(false);

  const classes = useStyles();

  const handleKeyboardSortInput = (e: { key: string }) => {
    if (e.key === 'Enter') {
      toggleSort(index);
    }

    return false;
  };

  const handleSortClick = () => {
    toggleSort(index);
  };

  const { className, ...otherProps } = cellHeaderProps;
  const sortActive = sortDirection !== 'none' && sortDirection !== undefined;
  const ariaSortDirection = sortDirection === 'none' ? false : sortDirection;

  const sortLabelProps = {
    classes: { root: classes.sortLabelRoot },
    tabIndex: -1,
    active: sortActive,
    hideSortIcon: true,
    ...(ariaSortDirection ? { direction: sortDirection as 'asc' | 'desc' | undefined } : {}),
  };

  const cellClass = clsx({
    [classes.root]: true,
    [classes.fixedHeader]: options.fixedHeader,
    'datatables-noprint': !print,
    [className as string]: className,
  });

  const showHintTooltip = () => {
    setSortTooltipOpen(false);
    setHintTooltipOpen(true);
  };

  const getTooltipTitle = () => {
    if (!options.textLabels) {
      return '';
    }

    // @ts-ignore
    return options.textLabels.body.columnHeaderTooltip
      ? // @ts-ignore
        options.textLabels.body.columnHeaderTooltip(column)
      : // @ts-ignore
        options.textLabels.body.toolTip;
  };

  const closeTooltip = () => {
    setSortTooltipOpen(false);
  };

  return (
    <TableCell
      ref={(ref) => {
        setCellRef && setCellRef(index + 1, colPosition + 1, ref);
      }}
      className={cellClass}
      scope={'col'}
      sortDirection={ariaSortDirection}
      data-colindex={index}
      data-tableid={tableId}
      onMouseDown={closeTooltip}
      {...otherProps}
    >
      {options.sort && sort ? (
        <span className={classes.contentWrapper}>
          <MuiTooltip
            title={getTooltipTitle() as string}
            placement="bottom"
            open={sortTooltipOpen}
            onOpen={() => !!getTooltipTitle() && setSortTooltipOpen(true)}
            onClose={() => setSortTooltipOpen(false)}
            classes={{
              tooltip: classes.tooltip,
              popper: classes.mypopper,
            }}
          >
            <Button
              variant="text"
              onKeyUp={handleKeyboardSortInput}
              onClick={handleSortClick}
              className={classes.toolButton}
              data-testid={`headcol-${index}`}
            >
              <div className={classes.sortAction}>
                <div
                  className={clsx({
                    [classes.data]: true,
                    [classes.sortActive]: sortActive,
                  })}
                >
                  {children}
                </div>
                <div className={classes.sortAction}>
                  <TableSortLabel
                    IconComponent={theme.props?.MuiTableSortLabel?.IconComponent ?? SortArrowIcon}
                    {...sortLabelProps}
                  />
                </div>
              </div>
            </Button>
          </MuiTooltip>
          {hint && (
            <MuiTooltip title={hint}>
              <HelpIcon
                className={!sortActive ? classes.hintIconAlone : classes.hintIconWithSortIcon}
                fontSize="small"
              />
            </MuiTooltip>
          )}
        </span>
      ) : (
        <div className={hint ? classes.sortAction : undefined}>
          {children}
          {hint && (
            <MuiTooltip
              title={hint}
              placement={'bottom-end'}
              open={hintTooltipOpen}
              onOpen={() => showHintTooltip()}
              onClose={() => setHintTooltipOpen(false)}
              classes={{
                tooltip: classes.tooltip,
                popper: classes.mypopper,
              }}
              enterDelay={300}
            >
              <HelpIcon className={classes.hintIconAlone} fontSize="small" />
            </MuiTooltip>
          )}
        </div>
      )}
    </TableCell>
  );
};

export default withTheme(TableHeadCell);
