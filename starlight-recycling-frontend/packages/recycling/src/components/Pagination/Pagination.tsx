import React, { FC } from 'react';
import TablePagination from '@material-ui/core/TablePagination';
import { makeStyles } from '@material-ui/core/styles';

interface PaginationProps {
  count: number;
  page: number;
  perPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (perPage: number) => void;
}

const useStyles = makeStyles(() => ({
  spacer: {
    flex: '0 1 0',
  },
}));

export const Pagination: FC<PaginationProps> = ({
  count,
  page,
  perPage,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const classes = useStyles();

  return (
    <TablePagination
      component="div"
      classes={classes}
      count={count}
      page={page}
      onChangePage={(e, newPage) => onChangePage(newPage)}
      rowsPerPage={perPage}
      onChangeRowsPerPage={(e) => {
        onChangeRowsPerPage(parseInt(e.target.value, 10));
        onChangePage(0);
      }}
    />
  );
};

export default Pagination;
