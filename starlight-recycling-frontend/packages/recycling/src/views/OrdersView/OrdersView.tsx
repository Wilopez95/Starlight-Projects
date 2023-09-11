import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GeneralView,
  Protected,
  ProtectedTab,
  showError,
  showSuccess,
  useOpenFormWithCloseConfirmation,
} from '@starlightpro/common';
import { Trans, useTranslation } from '../../i18n';
import { Link } from 'react-router-dom';
import { Location } from 'history';
import { RouteComponentProps } from 'react-router';
import { isString } from 'lodash-es';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Tab, Tabs, Typography } from '@material-ui/core';
import { openModal } from '@starlightpro/common/components/Modals';

import {
  GetOrdersIndexedWithStatusAggregationQuery,
  GetOrdersIndexedWithStatusAggregationQueryVariables,
  OrdersIndexedFilter,
  OrderStatus,
  useApproveOrdersMutation,
  useFinalizeOrdersMutation,
  useGetOrdersIndexedWithStatusAggregationQuery,
  useGetUserInfoQuery,
} from '../../graphql/api';
import Datatable from '../../components/Datatable';
import { showOrder } from './OrderView';
import Button from '@material-ui/core/Button';
import { NonServiceOrder } from '../YardOperationConsole/NonServiceOrder';
import { useHighlight } from '../../hooks/useHighlight';
import { PageTitleSetter } from '../../components/PageTitle';
import { getOrdersColumns, getSortName } from './config';
import { DocumentTitleSetter } from '../../components/DocumentTitle';
import {
  defaultCountByStatus,
  orderHighlightColumns,
  OrderPath,
  orderPathByStatusMapping,
  orderStatusByPathMapping,
  orderStatuses,
  orderStatusMapping,
} from './constant';
import { useUserIsAllowedToApproveOrder } from '../YardOperationConsole/hooks/useUserIsAllowedToApproveOrder';
import { useUserIsAllowedToFinalizeOrder } from '../YardOperationConsole/hooks/useUserIsAllowedToFinalizeOrder';
import { PdfPreviewModalContent } from '../YardOperationConsole/components/WeightTicketField/PdfPreviewModalContent';
import { DataTableState } from '../../components/Datatable/types';
import { Routes } from '../../routes';
import { useUserIsAllowedToInvoiceOrder } from '../YardOperationConsole/hooks/useUserIsAllowedToInvoiceOrder';
import { useCompanyMeasurementUnits } from '../../hooks/useCompanyMeasurementUnits';
import moment from 'moment';
import delay from '../../utils/delay';
import { convertKgToUom } from '../../hooks/useUnitOfMeasurementConversion';
import { formatMoney } from '../../i18n/format/currency/enUS';

const useStyles = makeStyles(
  ({ spacing }) => ({
    bull: {
      margin: spacing(0, 1),
    },
    applyAllAction: {
      marginRight: spacing(3),
    },
    statusHeadCol: {
      width: 110,
    },
    tabsRoot: {
      flex: '4 1 auto',
    },
    leftAlign: {
      textAlign: 'left',
    },
    rightAlign: {
      textAlign: 'right',
    },
    cellContent: {
      flex: 1,
    },
  }),
  { name: 'OrdersView' },
);

export const ORDERS_PER_PAGE = 10;

let refetchOrders: () => Promise<any> = () => Promise.resolve();

export const refreshAllOrders = async () => {
  await delay(1000);
  await refetchOrders();
};

export interface OrdersViewProps {
  title?: ReactNode;
  location: Location;
  applicationUrl?: string;
  pageTitle?: string;
  my?: boolean;
  match?: RouteComponentProps<{ subPath: OrderPath | 'all'; customerId: string }>['match'];
  LinkComponent?: typeof Link;
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
  onInvoiceAllClick?(): void;
}

export const OrdersView: FC<OrdersViewProps> = ({
  match,
  pageTitle,
  title = <Trans>Orders</Trans>,
  my,
  formContainer,
  location,
  applicationUrl,
  LinkComponent = Link,
  onInvoiceAllClick,
}) => {
  const classes = useStyles();
  const rootRef = useRef<any>();
  const [openForm] = useOpenFormWithCloseConfirmation({
    closeOnSubmitted: false,
    stacked: false,
    container: formContainer ?? rootRef.current,
  });
  const { data: meData } = useGetUserInfoQuery();
  const [approveOrdersMutation] = useApproveOrdersMutation();
  const [finalizeOrdersMutation] = useFinalizeOrdersMutation();
  const [t] = useTranslation();
  const [selected, setSelected] = useState<number[] | null>(null);
  const owner = (my && meData?.userInfo?.id) || undefined;
  const customerId = match?.params.customerId || '';
  const orderPath = useMemo<OrderPath | undefined>(
    () => (match?.params.subPath === 'all' ? undefined : match?.params.subPath),
    [match?.params.subPath],
  );
  const status = orderPath && orderStatusByPathMapping[orderPath];
  const path = location.pathname.replace(
    /\/((orders)(.*)$)/gm,
    my ? `/${Routes.Orders}/${Routes.My}` : `/${Routes.Orders}`,
  );
  const [countByStatus, setCountByStatus] = useState<
    GetOrdersIndexedWithStatusAggregationQuery['indexedOrdersGroupByStatusTotal']
  >(defaultCountByStatus);
  const [tableState, setTableState] = useState<
    Pick<DataTableState, 'page' | 'rowsPerPage' | 'searchText' | 'sortOrder'>
  >({
    page: 0,
    rowsPerPage: ORDERS_PER_PAGE,
    searchText: '',
    sortOrder: {
      direction: 'desc',
      name: 'createdAt',
    },
  });
  const [activeFilters, setActiveFilters] = useState<OrdersIndexedFilter>({});
  const variables = useMemo<GetOrdersIndexedWithStatusAggregationQueryVariables>(() => {
    const common = {
      ...activeFilters,
      status: orderStatuses,
    };

    if (tableState.searchText) {
      common.search = tableState.searchText;
    }

    if (owner) {
      common.owner = [owner];
    }

    if (customerId) {
      common.customerId = [parseInt(customerId, 10)];
    }

    const filter: OrdersIndexedFilter = {
      ...common,
      status: status ? [status] : orderStatuses,
    };

    return {
      filter,
      sort: [
        { field: getSortName(tableState.sortOrder.name), order: tableState.sortOrder.direction },
      ],
      pagination: {
        page: tableState.page * tableState.rowsPerPage,
        perPage: tableState.rowsPerPage,
      },
      aggregationFilter: common,
    };
  }, [
    activeFilters,
    customerId,
    owner,
    status,
    tableState.page,
    tableState.rowsPerPage,
    tableState.searchText,
    tableState.sortOrder.direction,
    tableState.sortOrder.name,
  ]);
  const { data: indexedData, loading, refetch } = useGetOrdersIndexedWithStatusAggregationQuery({
    variables,
    fetchPolicy: 'no-cache',
  });
  const count = indexedData?.ordersGrid.total || 0;
  const orders = useMemo(() => indexedData?.ordersGrid.data || [], [indexedData?.ordersGrid.data]);
  const { massTranslation, convertWeights } = useCompanyMeasurementUnits();

  useEffect(() => {
    if (!indexedData) {
      return;
    }
    setCountByStatus(indexedData.indexedOrdersGroupByStatusTotal);
  }, [indexedData]);

  useEffect(() => {
    // keep up to date exposed refetch function
    if (refetch) {
      refetchOrders = () => refetch(variables);
    }

    return () => {
      refetchOrders = () => Promise.resolve();
    };
  }, [refetch, variables]);

  const approveOrders = useCallback(
    async (ids: number[] | null) => {
      try {
        await approveOrdersMutation({
          variables: {
            ids,
          },
        });

        await refreshAllOrders();

        showSuccess(<Trans>Selected orders approved successfully.</Trans>);
      } catch (e) {
        showError(<Trans>Failed to approve orders</Trans>);
      }
      setSelected(null);
    },
    [approveOrdersMutation],
  );

  const finalizeOrders = useCallback(
    async (ids: number[] | null) => {
      try {
        await finalizeOrdersMutation({
          variables: {
            ids,
          },
        });

        await refreshAllOrders();
        showSuccess(<Trans>Selected orders finalized successfully.</Trans>);
      } catch (e) {
        showError(<Trans>Failed to finalize orders</Trans>);
      }
      setSelected(null);
    },
    [finalizeOrdersMutation],
  );

  const tabs = useMemo(
    () =>
      orderStatuses.map((orderStatus) => (
        <ProtectedTab
          key={orderStatus}
          permissions="recycling:Order:list"
          component={LinkComponent}
          label={
            <Box>
              <Trans>{orderStatus}</Trans>
              <span className={classes.bull}>&bull;</span>
              <Typography variant="body2" component="span">
                {countByStatus[orderStatusMapping[orderStatus] as keyof typeof countByStatus]}
              </Typography>
            </Box>
          }
          value={`${path}/${orderPathByStatusMapping[orderStatus]}`}
          to={`${path}/${orderPathByStatusMapping[orderStatus]}`}
          fallback={
            <Tab
              label={
                <Box>
                  <Trans>{orderStatus}</Trans>
                  <span className={classes.bull}>&bull;</span>
                  <Typography variant="body2" component="span">
                    {countByStatus[orderStatusMapping[orderStatus] as keyof typeof countByStatus]}
                  </Typography>
                </Box>
              }
              disabled
            />
          }
        />
      )),
    [LinkComponent, classes.bull, countByStatus, path],
  );
  const openWeightTicketPreview = (orderId: number) => {
    openModal({
      content: <PdfPreviewModalContent orderId={orderId} />,
    });
  };
  const orderColumns = useHighlight({
    defaultColumns: getOrdersColumns({
      status,
      customerId,
      orders,
      t,
      openWeightTicketPreview,
      classes: {
        leftAlign: classes.leftAlign,
        rightAlign: classes.rightAlign,
        cellContent: classes.cellContent,
      },
      massTranslation,
      convertWeights,
      myOrdersPage: my,
      convertMaterialWeights: convertKgToUom,
    }),
    highlightColumns: orderHighlightColumns,
    data: orders,
    highlightElementType: 'span',
  });
  const ordersIds = useMemo(() => orders.map((order) => order.id), [orders]);
  const rowsSelected = useMemo(() => (selected || []).map((id) => ordersIds.indexOf(id)), [
    ordersIds,
    selected,
  ]);
  const isAllowedApproveOrder = useUserIsAllowedToApproveOrder();
  const isAllowedFinalizeOrder = useUserIsAllowedToFinalizeOrder();
  const isAllowedInvoiceOrder = useUserIsAllowedToInvoiceOrder();

  const statusPermissionMapping = {
    [OrderStatus.Completed]: isAllowedApproveOrder,
    [OrderStatus.Approved]: isAllowedFinalizeOrder,
    [OrderStatus.Finalized]: isAllowedInvoiceOrder,
  };

  const onTableChange = useCallback((action: string, tableState: DataTableState) => {
    setTableState((variables) => {
      switch (action) {
        case 'sort':
        case 'changePage':
        case 'changeRowsPerPage':
        case 'search':
          return tableState;
        case 'filterChange':
        case 'resetFilters':
          const { filterList, columns } = tableState;
          const filter: Record<string, any> = {};
          filterList.forEach((filterValue, index) => {
            const column = columns[index];

            if (filterValue.length) {
              filter[column.filterName || column.name] = filterValue.map((v) => {
                if (isString(v)) {
                  return v;
                }

                if ('from' in v) {
                  return {
                    from: moment.isMoment(v.from) ? v.from.startOf('day').format() : v.from,
                    to: moment.isMoment(v.to) ? v.to.endOf('day').format() : v.to,
                  };
                }

                return v.value;
              });
            }
          });

          if (filter.graded) {
            filter.graded = filter.graded[0] === 'true';
          }
          setActiveFilters(filter);

          return { ...tableState, page: 0 };

        default:
          return variables;
      }
    });
  }, []);

  const allowRenderActionButton = () => {
    if (!status) {
      return false;
    }

    // hide Invoice all button on customer orders page
    if (status === OrderStatus.Finalized && customerId) {
      return false;
    }

    return [OrderStatus.Completed, OrderStatus.Approved, OrderStatus.Finalized].includes(status);
  };

  const actionButtonClickHandler = useCallback(() => {
    switch (status) {
      case OrderStatus.Completed:
        approveOrders(selected);
        break;
      case OrderStatus.Approved:
        finalizeOrders(selected);
        break;
      case OrderStatus.Finalized:
        if (onInvoiceAllClick) {
          onInvoiceAllClick();
        }
        break;
    }
  }, [approveOrders, finalizeOrders, onInvoiceAllClick, selected, status]);
  const actionButtonTitle = useMemo(
    () => ({
      [OrderStatus.Completed]: t(selected ? 'Approve Selected' : 'Approve All'),
      [OrderStatus.Approved]: t(selected ? 'Finalize Selected' : 'Finalize All'),
      [OrderStatus.Finalized]: t('Invoice All Orders'),
    }),
    [selected, t],
  );

  return (
    <GeneralView
      ref={rootRef}
      title={!selected ? title : `${selected.length} ${t('Order(s) selected')}`}
      actions={
        <Box>
          {allowRenderActionButton() && (
            <Protected permissions="recycling:Order:update">
              <Button
                color="primary"
                variant="outlined"
                onClick={actionButtonClickHandler}
                className={classes.applyAllAction}
                disabled={
                  !statusPermissionMapping[
                    status as OrderStatus.Completed | OrderStatus.Approved | OrderStatus.Finalized
                  ]
                }
              >
                {
                  actionButtonTitle[
                    status as OrderStatus.Completed | OrderStatus.Approved | OrderStatus.Finalized
                  ]
                }
              </Button>
            </Protected>
          )}
          <Protected permissions="recycling:NonServiceOrder:create">
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                openForm({
                  form: (
                    <NonServiceOrder
                      onSubmitted={async () => {
                        await refreshAllOrders();
                      }}
                    />
                  ),
                })
              }
            >
              +&nbsp;<Trans>Create New Order</Trans>
            </Button>
          </Protected>
        </Box>
      }
    >
      {pageTitle && (
        <>
          <PageTitleSetter pageTitle={pageTitle} />
          <DocumentTitleSetter title={pageTitle} />
        </>
      )}
      <Datatable
        title=""
        columns={orderColumns}
        data={
          loading
            ? []
            : orders.map((order) => {
                return {
                  ...order,
                  grandTotal: formatMoney(order.grandTotal),
                };
              })
        }
        // data={[]}
        loading={loading}
        options={{
          ...tableState,
          count,
          searchText: tableState.searchText || undefined,
          selectableRows:
            status === OrderStatus.Completed || status === OrderStatus.Approved
              ? 'multiple'
              : 'none',
          selectableRowsHeader: true,
          selectableRowsHideCheckboxes: false,
          search: true,
          serverSide: true,
          filter: true,
          rowsSelected,
          onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelected) => {
            if (!rowsSelected) {
              return;
            }
            setSelected(
              rowsSelected.length ? rowsSelected.map((dataIndex) => orders[dataIndex].id) : null,
            );
          },
          onTableChange,
          onRowClick: (rowData, rowMeta) => {
            const { dataIndex } = rowMeta;
            const order = orders[dataIndex];

            if (order) {
              showOrder({
                orderId: order.id,
                onEditSubmitted() {
                  refreshAllOrders();
                },
                quickViewContainer: formContainer ?? rootRef.current,
                applicationUrl,
              });
            }
          },
          searchPlaceholder: t('Search Order #, WO#'),
          customToolbar: () => (
            <Tabs
              value={match?.url || '/all'}
              aria-label="tabs"
              indicatorColor="primary"
              className={classes.tabsRoot}
            >
              <ProtectedTab
                permissions="recycling:Order:list"
                component={LinkComponent}
                fallback={
                  <Tab
                    label={
                      <Box>
                        <Trans>Orders</Trans>
                        <span className={classes.bull}>&bull;</span>
                        <Typography variant="body2" component="span">
                          {countByStatus.all}
                        </Typography>
                      </Box>
                    }
                    disabled
                  />
                }
                label={
                  <Box>
                    <Trans>All Orders</Trans>
                    <span className={classes.bull}>&bull;</span>
                    <Typography variant="body2" component="span">
                      {countByStatus.all}
                    </Typography>
                  </Box>
                }
                value={`${path}/all`}
                to={`${path}/all`}
              />
              {tabs}
            </Tabs>
          ),
        }}
      />
    </GeneralView>
  );
};

export default OrdersView;
