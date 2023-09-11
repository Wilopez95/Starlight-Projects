import React, { FC, useCallback, useLayoutEffect, useRef } from 'react';
import { times, isString } from 'lodash-es';
import MUIDataTable, { TableBody } from 'mui-datatables';
import { Trans, useTranslation } from '../../i18n';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';
import TableFooter from '@material-ui/core/TableFooter';
import MuiTableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import Skeleton from '@material-ui/lab/Skeleton';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import DefaultTableToolbar from './TableToolbar';
import DefaultTableHead from './TableHead';
import { DatatableProps } from './types';

// disable propTypes validation on MUIDataTable as we are using our own types for liters
// rely only on TypeScript compile time validation
if ((MUIDataTable as any).Naked) {
  (MUIDataTable as any).Naked.propTypes = undefined;
}

const useStyles = makeStyles(
  ({ palette }) => ({
    root: {
      tableLayout: 'fixed',
      width: 'auto',
      minWidth: '100%',
    },
    row: {
      wordBreak: 'break-word',
      '&:focus-visible': {
        outline: `2px solid ${palette.orange}`,
      },
    },
  }),

  { name: 'Datatable' },
);

const NullComponent = () => null;

const TableLoading = ({ columns }: any) => {
  return (
    <TableFooter>
      {times(10, (v) => (
        <TableRow key={v}>
          {columns
            .filter(({ display }: any) => display === 'true')
            .map((column: any) => (
              <TableCell key={isString(column) ? column : column.name}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
        </TableRow>
      ))}
    </TableFooter>
  );
};

export const Datatable: FC<DatatableProps> = ({
  title,
  data,
  columns,
  loading,
  options,
  components,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const mUIDataTableRef = useRef<typeof MUIDataTable | any>(null);
  const customTableBodyFooterRender = useCallback(
    ({ data, columns }: { data: any[]; columns: any[] }) => {
      if (!loading || data.length === 0) {
        return null;
      }

      return <TableLoading columns={columns} />;
    },
    [loading],
  );

  useLayoutEffect(() => {
    (mUIDataTableRef.current.tableRef as HTMLTableElement).removeAttribute('tabindex');
  }, [mUIDataTableRef?.current?.tableRef]);

  return (
    <MUIDataTable
      title={title}
      innerRef={mUIDataTableRef}
      data={data}
      columns={columns as any}
      options={{
        search: false,
        textLabels: {
          body: {
            noMatch: <Trans>No Results</Trans>,
          },
          pagination: {
            rowsPerPage: t('Rows per page'),
          },
        },
        filter: false,
        download: false,
        enableNestedDataAccess: '.',
        print: false,
        selectableRows: 'none',
        selectableRowsHeader: false,
        selectableRowsHideCheckboxes: true,
        selectToolbarPlacement: 'above',
        selectableRowsOnClick: false,
        serverSide: true,
        viewColumns: false,
        elevation: 0,
        customToolbarSelect: () => null,
        rowsPerPageOptions: [10, 25, 50, 100],
        fixedSelectColumn: false,
        fixedHeader: false,
        responsive: 'standard',
        setTableProps: () => ({ className: classes.root }),
        customTableBodyFooterRender,
        setRowProps: () => ({
          className: classes.row,
          tabIndex: 0,
          onKeyPress: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
            if (['Space', 'Enter'].includes(e.nativeEvent.code)) {
              (e.target as HTMLTableRowElement).click();
            }
          },
        }),
        ...options,
      }}
      components={{
        TableBody:
          loading && data.length === 0
            ? ({ columns }: { columns: { display: 'true' | 'false'; name: string }[] }) => (
                <MuiTableBody>
                  {times(5, (v) => (
                    <TableRow key={v}>
                      {columns
                        .filter(({ display }) => display === 'true')
                        .map((column) => (
                          <TableCell key={isString(column) ? column : column.name}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </MuiTableBody>
              )
            : TableBody,
        TableToolbar: components?.TableToolbar || DefaultTableToolbar,
        TableHead: components?.TableHead || DefaultTableHead,
        Checkbox: CheckBoxField,
        TableFilterList: components?.TableFilterList || NullComponent,
        ...components,
      }}
    />
  );
};

export default Datatable;
