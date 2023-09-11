import React, { FC, useMemo, useState } from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Search from '../Search';
import FilterToolbar from '../Filter/FilterToolbar';
import { FilterToolbarProps } from '../Filter/FilterToolbar/FilterToolbar';

const useStyles = makeStyles((theme: Theme) => ({
  tabs: {
    flexGrow: 1,
  },
  search: {
    width: 278,
    display: 'flex',
    alignItems: 'center',
  },
  spacer: {
    width: 24,
    borderBottom: `2px solid ${theme.palette.common.white}`,
    zIndex: 1,
    backgroundColor: theme.palette.common.white,
  },
}));

export interface TableToolbarProps {
  classes?: {
    tabs?: string;
    spacer?: string;
    search?: string;
  };
  onSearchTextChange?: (text: string) => void;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  showFilterToolbar?: boolean;
  filterToolbarProps?: FilterToolbarProps;
}

export const TableToolbar: FC<TableToolbarProps> = ({
  children,
  classes: classesProp,
  onSearchTextChange = () => {},
  searchPlaceholder,
  hideSearch,
  showFilterToolbar,
  filterToolbarProps,
}) => {
  const classes = useStyles({ classes: classesProp });
  const [showFilter, setShowFilter] = useState(false);

  const searchWithSpacer = useMemo(
    () => (
      <>
        <Box className={classes.spacer} />
        <Box className={classes.search}>
          <Search
            showEndAdornment={showFilterToolbar}
            placeholder={searchPlaceholder}
            onChange={onSearchTextChange}
            onClickEndAdornment={() => setShowFilter(!showFilter)}
            filterState={showFilter}
          />
        </Box>
      </>
    ),
    [
      classes.search,
      classes.spacer,
      onSearchTextChange,
      searchPlaceholder,
      showFilter,
      showFilterToolbar,
    ],
  );

  return (
    <Box width="100%">
      <Box display="flex" alignItems="stretch" width="100%">
        <Box className={classes.tabs}>{children}</Box>
        {!hideSearch && searchWithSpacer}
      </Box>
      {showFilterToolbar && filterToolbarProps && (
        <Collapse in={showFilter} timeout={300}>
          <FilterToolbar {...filterToolbarProps} />
        </Collapse>
      )}
    </Box>
  );
};

export default TableToolbar;
