// COPY & PASTE from mui-datatables
// modified

import React, { useCallback, useMemo, useState } from 'react';
import cs from 'classnames';
import { debounce } from 'lodash-es';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import TableSearch from './TableSearch';
import {
  DisplayData,
  MUIDataTableData,
  MUIDataTableOptions,
  MUIDataTableState,
  Popover,
  TableViewCol,
} from 'mui-datatables';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import PrintIcon from '@material-ui/icons/Print';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import FilterIcon from '../icons/Filter';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import { makeStyles } from '@material-ui/core/styles';
import MuiTooltip from '@material-ui/core/Tooltip';
import TableFilterList from './TableFilter/TableFilterList';
import { DataTableColumnState, FilterFormValue } from './types';
import { Form } from 'react-final-form';
import { DownloadButton } from './DownloadButton';
import { Box } from '@material-ui/core';

import { FilterChangeTracker } from './FilterChangeTracker';
import { EMPTY_FIELD } from './constants';
import { mapFilterType } from './utils';
import { isArray } from 'lodash/fp';

const SEARCH_TEXT_DEBOUNCE = 500;

const useStyles = makeStyles(
  ({ palette, breakpoints }) => ({
    root: {
      paddingLeft: 0,
      alignItems: 'flex-end',
      [breakpoints.up('sm')]: {
        minHeight: 60,
        paddingRight: 0,
      },
      '@media print': {
        display: 'none',
      },
      [breakpoints.down('xs')]: {
        display: 'block',
        '@media print': {
          display: 'none !important',
        },
      },
    },
    fullWidthRoot: {},
    left: {
      flex: '1 1 auto',

      [breakpoints.down('sm')]: {
        padding: '8px 0px',
      },

      [breakpoints.down('xs')]: {
        padding: '8px 0px 0px 0px',
      },
    },
    fullWidthLeft: {
      flex: '1 1 auto',
    },
    actions: {
      flex: '1 1 auto',
      textAlign: 'right',

      [breakpoints.down('sm')]: {
        textAlign: 'right',
      },

      [breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    fullWidthActions: {
      flex: '1 1 auto',
      textAlign: 'right',
    },
    spacer: {
      width: 24,
      borderBottom: `2px solid ${palette.common.white}`,
      zIndex: 1,
      backgroundColor: palette.common.white,

      [breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    titleRoot: {},
    titleText: {
      [breakpoints.down('sm')]: {
        fontSize: '1rem',
      },

      [breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    fullWidthTitleText: {
      textAlign: 'left',
    },
    icon: {
      '&:hover': {
        color: palette.primary.main,
      },
    },
    iconActive: {
      color: palette.primary.main,
    },
    filterPaper: {
      maxWidth: '50%',
    },
    filterCloseIcon: {
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 100,
    },
    searchIcon: {
      display: 'inline-flex',
      marginTop: '10px',
      marginRight: '8px',
    },
    filterOpen: {
      '&$filterButton': {
        color: palette.primary.main,
      },
      '& $filterButtonArrow': {
        transform: 'rotate(-180deg)',
      },
    },
    filterButton: {
      position: 'relative',
      width: '53px',
      outlineOffset: '-4px',
    },
    filterButtonIcon: {
      marginTop: 5,
    },
    filterButtonArrow: {
      position: 'absolute',
      right: 0,
    },
  }),
  { name: 'DataTableToolbar' },
);

const RESPONSIVE_FULL_WIDTH_NAME = 'scrollFullHeightFullWidth';

export interface MUIDataTableToolbar {
  columnOrder?: number[];
  classes?: object;
  columns: DataTableColumnState[];
  data?: MUIDataTableData[];
  displayData?: DisplayData;
  filterData?: any[][];
  filterList?: MUIDataTableState['filterList'];
  filterUpdate?: (...args: any) => any;
  updateFilterByType?: (...args: any) => any;
  options?: MUIDataTableOptions;
  resetFilters?: () => any;
  searchClose?: () => any;
  searchTextUpdate?: (...args: any) => any;
  setTableActions?: (...args: any) => any;
  tableRef?: (...args: any) => any;
  title?: React.ReactNode;
  toggleViewColumn?: (a: any) => any;
  searchText?: string;

  // internal to MUIDatatable
  setTableAction(action: string): void;
  updateColumns(...args: any): void;
  components?: any;
}

const initialValues = {
  searchText: '',
  fields: [EMPTY_FIELD],
};

export const TableToolbar: React.FC<MUIDataTableToolbar> = ({
  data,
  displayData,
  columns,
  options = {},
  columnOrder,
  searchText: searchTextProp,
  setTableAction,
  filterData,
  filterList,
  filterUpdate,
  resetFilters,
  toggleViewColumn,
  updateColumns,
  // title,
  components = {},
  updateFilterByType,
  searchTextUpdate,
  tableRef,
  searchClose,
}) => {
  const classes = useStyles();
  const [iconActive, setIconActive] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(
    Boolean(searchTextProp || options?.searchText || options?.searchOpen),
  );
  const [searchText, setSearchText] = useState(searchTextProp || '');
  const filtersEnabled = !(options?.filter === false || options?.filter === 'false');
  const searchEnabled = !(options?.search === false || options?.search === 'false');

  const Tooltip = MuiTooltip;
  const TableViewColComponent = TableViewCol;
  const { downloadCsv, print, viewColumns, filterTable } = options?.textLabels?.toolbar || {};

  const showSearchFn = useCallback(() => {
    setTableAction('onSearchOpen');

    if (options?.onSearchOpen) {
      options?.onSearchOpen();
    }

    return true;
  }, [options, setTableAction]);

  const isSearchShown = useCallback(
    (iconName: any) => {
      let nextVal = false;

      if (showSearch) {
        if (searchText) {
          nextVal = true;
        } else {
          setTableAction('onSearchClose');

          if (options?.onSearchOpen) {
            options?.onSearchOpen();
          }

          nextVal = false;
        }
      } else if (iconName === 'search') {
        nextVal = showSearchFn();
      }

      return nextVal;
    },
    [options, searchText, setTableAction, showSearch, showSearchFn],
  );

  const setActiveIcon = useCallback(
    (nextIconName?: any) => {
      setShowSearch(isSearchShown(nextIconName));
      setIconActive(nextIconName);

      if (nextIconName === 'filter') {
        setTableAction('onFilterDialogOpen');

        if (options?.onFilterDialogOpen) {
          options?.onFilterDialogOpen();
        }
      }

      if (nextIconName === undefined && iconActive === 'filter') {
        setTableAction('onFilterDialogClose');

        if (options?.onFilterDialogClose) {
          options?.onFilterDialogClose();
        }
      }
    },
    [iconActive, isSearchShown, options, setTableAction],
  );

  const getActiveIcon = useCallback(
    (styles: any, iconName: any) => {
      let isActive = iconActive === iconName;

      if (iconName === 'search') {
        isActive = !!(isActive || showSearch || searchText);
      }

      return isActive ? styles.iconActive : styles.icon;
    },
    [iconActive, searchText, showSearch],
  );

  const hideSearch = useCallback(() => {
    setTableAction('onSearchClose');

    if (options?.onSearchClose) {
      options?.onSearchClose();
    }

    if (searchClose) {
      searchClose();
    }

    setIconActive(null);
    setShowSearch(false);
    setSearchText('');
  }, [options, searchClose, setTableAction]);

  const handleSearch = useMemo(
    () =>
      debounce((value: any) => {
        setSearchText(value);

        if (searchTextUpdate) {
          searchTextUpdate(value);
        }
      }, SEARCH_TEXT_DEBOUNCE),
    [setSearchText, searchTextUpdate],
  );

  const filtersButton =
    (filtersEnabled && (
      <Tooltip title={filterTable || ''} disableFocusListener>
        <IconButton
          data-testid={filterTable + '-iconButton'}
          aria-label={filterTable}
          classes={{
            root: cs(classes.filterButton, {
              [classes.filterOpen]: filtersOpen,
            }),
          }}
          disabled={options?.filter === 'disabled'}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <FilterIcon className={classes.filterButtonIcon} />
          <ArrowDropDownIcon className={classes.filterButtonArrow} />
        </IconButton>
      </Tooltip>
    )) ||
    undefined;

  return (
    <Form<FilterFormValue>
      initialValues={initialValues}
      onSubmit={({ searchText: nextSearchText, fields }) => {
        if (searchText !== nextSearchText) {
          handleSearch(nextSearchText);

          return;
        }

        if (!filterUpdate || !fields.length) {
          return;
        }

        if (resetFilters) {
          resetFilters();
        }

        if (fields.length === 1 && fields[0].columnIndex === -1) {
          // reset
          return;
        }

        fields.forEach(({ value, columnIndex }) => {
          if (columnIndex !== -1) {
            const column = columns[columnIndex];

            filterUpdate(
              columnIndex,
              isArray(value) ? value : [value],
              column.filterName || column.name,
              mapFilterType(column.filterType),
            );
          }
        });
      }}
      subscription={{}}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <FilterChangeTracker
            columns={columns}
            searchText={searchText}
            handleSearch={handleSearch}
            filterList={filterList}
            filterUpdate={filterUpdate}
          />
          <Box display="none">
            <button type="submit"></button>
          </Box>
          <Toolbar
            className={
              // eslint-disable-next-line
              // @ts-ignore
              options?.responsive !== RESPONSIVE_FULL_WIDTH_NAME
                ? classes.root
                : classes.fullWidthRoot
            }
            role="toolbar"
            aria-label={'Table Toolbar'}
          >
            {displayData &&
              options.customToolbar &&
              options.customToolbar({ displayData: displayData })}
            <div className={classes.spacer}></div>
            <div
              className={
                // eslint-disable-next-line
                // @ts-ignore
                options?.responsive !== RESPONSIVE_FULL_WIDTH_NAME
                  ? classes.actions
                  : classes.fullWidthActions
              }
            >
              {!(options?.download === false || options?.download === 'false') && (
                <DownloadButton
                  label={downloadCsv}
                  columnOrder={columnOrder}
                  columns={columns}
                  data={data}
                  displayData={displayData}
                  options={options}
                  classes={{
                    icon: classes.icon,
                  }}
                />
              )}
              {!(options?.print === false || options?.print === 'false') && (
                <span>
                  <ReactToPrint content={() => tableRef && tableRef()}>
                    <PrintContextConsumer>
                      {({ handlePrint }) => (
                        <span>
                          <Tooltip title={print || ''}>
                            <IconButton
                              data-testid={print + '-iconButton'}
                              aria-label={print}
                              disabled={options?.print === 'disabled'}
                              onClick={handlePrint}
                              classes={{ root: classes.icon }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                        </span>
                      )}
                    </PrintContextConsumer>
                  </ReactToPrint>
                </span>
              )}
              {!(options?.viewColumns === false || options?.viewColumns === 'false') && (
                <Popover
                  // eslint-disable-next-line
                  // @ts-ignore
                  refExit={setActiveIcon.bind(null)}
                  classes={{ closeIcon: classes.filterCloseIcon }}
                  hide={options?.viewColumns === 'disabled'}
                  trigger={
                    <Tooltip title={viewColumns || ''} disableFocusListener>
                      <IconButton
                        data-testid={viewColumns + '-iconButton'}
                        aria-label={viewColumns}
                        classes={{ root: getActiveIcon(classes, 'viewcolumns') }}
                        disabled={options?.viewColumns === 'disabled'}
                        onClick={setActiveIcon.bind(null, 'viewcolumns')}
                      >
                        <ViewColumnIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  content={
                    <TableViewColComponent
                      data={data}
                      columns={columns}
                      options={options}
                      // eslint-disable-next-line
                      // @ts-ignore
                      onColumnUpdate={toggleViewColumn}
                      updateColumns={updateColumns}
                      components={components}
                    />
                  }
                />
              )}
              {(searchEnabled &&
                (options?.customSearchRender ? (
                  options?.customSearchRender(searchText, handleSearch, hideSearch, options)
                ) : (
                  <TableSearch
                    searchText={searchText}
                    onSearch={async (v) => handleSearch(v)}
                    onHide={hideSearch}
                    // eslint-disable-next-line
                    // @ts-ignore
                    options={options}
                    endAdornment={filtersButton}
                  />
                ))) ||
                filtersButton}
            </div>
          </Toolbar>
          {filtersEnabled && (
            <TableFilterList
              columns={columns}
              options={options}
              filterList={filterList || []}
              filterData={filterData || []}
              filterUpdate={filterUpdate}
              updateFilterByType={updateFilterByType}
              onFilterReset={resetFilters}
              filtersOpen={filtersOpen}
            />
          )}
        </form>
      )}
    </Form>
  );
};

export default TableToolbar;
