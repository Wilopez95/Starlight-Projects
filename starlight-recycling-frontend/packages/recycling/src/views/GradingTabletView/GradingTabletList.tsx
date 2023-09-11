import React, { FC, useCallback, useMemo, useState } from 'react';
import { Box, Toolbar, Typography } from '@material-ui/core';
import { Trans, useTranslation } from '../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import {
  CustomerTruckTypes,
  GetGradingOrdersIndexedQueryVariables,
  OrderStatus,
  OrderType,
  SortInput,
  useGetGradingOrdersIndexedQuery,
} from '../../graphql/api';
import Datatable from '../../components/Datatable';
import {
  GetFilterByFieldFuncType,
  getSearchBody,
  GetSortFuncFilterType,
} from '../../components/Filter/util';
import { FilterFormValues } from '../../components/Filter';
import { useHistory } from 'react-router';
import { customerTruckTypeTranslationMapping } from '../../constants/mapping';
import { orderTypeTranslationMapping } from '../OrdersView/constant';

const useStyles = makeStyles(({ spacing, palette, breakpoints }) => ({
  gradingLayoutRoot: {
    backgroundColor: palette.common.white,
    height: '100%',
    padding: 0,
    [breakpoints.up('lg')]: {
      backgroundColor: 'initial',
      height: 'initial',
      padding: spacing(3),
    },
  },
  toolbar: {
    minHeight: 120,
  },
  pageTitle: {
    fontSize: '1.65rem',
    flexGrow: 1,
    padding: `${spacing(3)}px 0 0 ${spacing(3.6)}px`,
    [breakpoints.up('lg')]: {
      padding: `${spacing(1)}px 0 ${spacing(3)}px`,
    },
  },
  statusFieldColHeader: {
    width: 100,
  },
  shortDescriptionColHeader: {
    width: 150,
  },
  mobileCellPadding: {
    paddingLeft: spacing(2),
    [breakpoints.up('lg')]: {
      paddingLeft: spacing(1.6),
    },
  },
  mobileCellHeaderPadding: {
    paddingLeft: spacing(4),
    [breakpoints.up('lg')]: {
      paddingLeft: spacing(3),
    },
  },
  breakWord: {
    wordWrap: 'break-word',
  },
}));

const defaultFilters = [
  {
    field: 'graded',
    value: ['false'],
  },
  {
    field: 'type.keyword',
    value: [OrderType.Dump],
  },
  {
    field: 'status.keyword',
    value: [OrderStatus.InYard, OrderStatus.WeightOut, OrderStatus.Payment],
  },
];

export const getOrdersFilterByField: GetFilterByFieldFuncType = (field, value) => {
  switch (field) {
    case 'graded':
      return {
        term: {
          [field]: value[0],
        },
      };
    default:
      return {
        terms: {
          [field]: value,
        },
      };
  }
};

const getOrdersSort: GetSortFuncFilterType = (field, order) => {
  switch (field) {
    case 'WONumber':
    case 'type':
    case 'customer.businessName':
    case 'customerTruck.truckNumber':
    case 'customerTruck.type':
      return {
        [`${field}.keyword`]: order,
      };
    default:
      return { [field]: order };
  }
};

export const GradingTabletList: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const [currentSort, setCurrentSort] = useState<SortInput>({
    field: 'createdAt',
    order: 'DESC',
  });
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const [filter] = useState<FilterFormValues['fields']>(defaultFilters);

  const variables = useMemo<GetGradingOrdersIndexedQueryVariables>(() => {
    const filterParams = [...filter];

    return {
      search: getSearchBody({
        page,
        perPage,
        currentSort,
        filter: filterParams,
        getSort: getOrdersSort,
        getFilterByField: getOrdersFilterByField,
      }),
    };
  }, [currentSort, filter, page, perPage]);

  const { data } = useGetGradingOrdersIndexedQuery({
    variables,
    fetchPolicy: 'no-cache',
  });

  const orders = useMemo(() => data?.ordersIndexed.data || [], [data?.ordersIndexed.data]);
  const count = data?.ordersIndexed.total || 0;

  const handleRowClick = useCallback(
    (rowData: string[], rowMeta: { dataIndex: number; rowIndex: number }) => {
      const { id } = orders[rowMeta.dataIndex];
      history.push(`/grading/${id}`);
    },
    [history, orders],
  );

  return (
    <Box className={classes.gradingLayoutRoot}>
      <Toolbar disableGutters>
        <Typography className={classes.pageTitle} variant="h4">
          <Trans>Work Orders</Trans>
        </Typography>
      </Toolbar>
      <Datatable
        title=""
        columns={[
          {
            name: 'customerTruck.truckNumber',
            label: t('Truck #'),
            options: {
              setCellProps: () => {
                return {
                  className: classes.mobileCellPadding,
                };
              },
              setCellHeaderProps: () => {
                return {
                  className: classes.mobileCellHeaderPadding,
                };
              },
            },
          },
          {
            name: 'customerTruck.type',
            label: t('Truck Type'),
            options: {
              sort: false,
              customBodyRender: (value: CustomerTruckTypes) =>
                customerTruckTypeTranslationMapping[value],
            },
          },
          {
            name: 'type',
            label: t('Action'),
            options: {
              sort: false,
              customBodyRender: (value: OrderType) => orderTypeTranslationMapping[value],
            },
          },
          {
            name: 'WONumber',
            label: t('WO#'),
          },
          {
            name: 'customer.businessName',
            label: t('Customer'),
            options: {
              setCellProps: () => {
                return {
                  className: classes.breakWord,
                };
              },
            },
          },
        ]}
        data={orders}
        options={{
          page,
          rowsPerPage: perPage,
          count,
          rowsSelected: [],
          sortOrder: {
            name: currentSort.field,
            direction: currentSort.order.toLowerCase() as 'asc' | 'desc',
          },
          onChangePage: setPage,
          onChangeRowsPerPage: (value) => {
            setPage(0);
            setPerPage(value);
          },
          onRowClick: handleRowClick,
          onColumnSortChange: (field, order) => {
            setCurrentSort({
              field,
              order: order.toUpperCase(),
            });
          },
        }}
      />
    </Box>
  );
};
