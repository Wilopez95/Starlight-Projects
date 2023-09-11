import React, { ChangeEvent, FC, useCallback, useContext, useEffect, useState } from 'react';
import { compact, debounce } from 'lodash-es';
import { gql } from '@apollo/client';
import { useTranslation } from '../../i18n';
import { GeneralView, showError, useOpenFormWithCloseConfirmation } from '@starlightpro/common';

import {
  GetOrdersIndexedWithYardConsoleAggregationQuery,
  GetOrdersIndexedWithYardConsoleAggregationQueryVariables,
  useGetOrdersIndexedWithYardConsoleAggregationLazyQuery,
  SortInput,
  OrderStatus,
  useGetHaulingMaterialsQuery,
} from '../../graphql/api';
import { EditOrder } from './EditOrder';
import { buildFetchVariables } from './config';
import { ORDERS_PER_PAGE } from '../OrdersView';
import Datatable from '../../components/Datatable';
import { showOrder } from '../OrdersView/OrderView';
import { orderStatuses } from '../OrdersView/constant';
import { PageTitleSetter } from '../../components/PageTitle';
import { useYardOperationConsoleColumns } from './defaultColumns';
import { DataTableState } from '../../components/Datatable/types';
import { DocumentTitleSetter } from '../../components/DocumentTitle';
import { YardOperationConsoleTabs } from './constants';
import { makeStyles } from '@material-ui/core';
import { DisplayData, MUIDataTableCheckboxProps } from 'mui-datatables';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';
import { ColumnWithHighlightDef } from '../../hooks/useHighlight';
import { Waypoint } from 'react-waypoint';
import { setRefetchYardOperationConsoleQuery } from './refreshYardOperationConsole';
import { PrintWeightTicketContext } from '../../components/PrintWeightTicket/PrintWeightTicket';
import { convertKgToUom, UnitOfMeasurementType } from '../../hooks/useUnitOfMeasurementConversion';
import { MaterialOrderContext } from '../../utils/contextProviders/MaterialOrderProvider';
import { useCompanyMeasurementUnits } from '../../hooks/useCompanyMeasurementUnits';

export const GET_ORDERS_INDEXED_WITH_YARD_CONSOLE_AGGREGATION = gql`
  query getOrdersIndexedWithYardConsoleAggregation(
    $search: SearchBodyInput!
    $aggregation: YardConsoleActivityInput!
  ) {
    ordersIndexed(search: $search) {
      data {
        id
        customer {
          id
          businessName
        }
        customerTruck {
          id
          truckNumber
          type
        }
        nonCommercialTruck {
          licensePlate
        }
        type
        WONumber
        createdAt
        graded
        weightIn
        weightOut
        netWeight
        status
        arrivedAt
        departureAt
        highlight
        hasWeightTicket
        materialId
        weightScaleUom
      }
      total
    }
    yardOperationConsoleActivity(input: $aggregation) {
      today
      inYard
      onTheWay
      selfService
    }
  }
`;

const useStyles = makeStyles(({ palette }) => ({
  pageTitle: {
    flexGrow: 1,
  },
  search: {
    width: 294,
  },
  loaderContainer: {
    height: 60,
    position: 'relative',
    backgroundColor: palette.common.white,
  },
  businessNameCol: {
    width: '20%',
  },
  statusCell: {
    whiteSpace: 'nowrap',
  },
  statusCol: {
    width: 110,
  },
  selectionCheckbox: {
    margin: 0,
  },
}));

type GridOrders = GetOrdersIndexedWithYardConsoleAggregationQuery['ordersIndexed']['data'];

export interface YardOperationConsoleGridProps {
  title: JSX.Element;
  columns: ColumnWithHighlightDef[];
  searchPlaceholder: string;
  selectableRows?: 'multiple' | 'none';
  selectableRowsHeader?: boolean;
  selectableRowsHideCheckboxes?: boolean;
  selectedIndexes?: number[];
  buildFetchVariables: typeof buildFetchVariables;
  customToolbar:
    | ((
        data: { displayData: DisplayData },
        consoleActivity?: GetOrdersIndexedWithYardConsoleAggregationQuery['yardOperationConsoleActivity'],
      ) => React.ReactNode)
    | undefined;
  onRowsSelected?: (indexes: number[], orders: GridOrders) => void;
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
}

export const YardOperationConsoleGrid: FC<YardOperationConsoleGridProps> = ({
  title,
  searchPlaceholder,
  selectableRows = 'none',
  selectableRowsHeader = false,
  selectableRowsHideCheckboxes = true,
  customToolbar,
  buildFetchVariables,
  columns: defaultColumns,
  onRowsSelected,
  selectedIndexes = [],
  formContainer,
}) => {
  const classes = useStyles();
  const [openForm] = useOpenFormWithCloseConfirmation({
    stacked: false,
    closeOnSubmitted: false,
    container: formContainer,
  });
  const [t] = useTranslation();
  const { weightTicket, clearWeightTicket } = useContext(PrintWeightTicketContext);
  const [currentSort, setCurrentSort] = useState<SortInput[]>([
    {
      field: 'arrivedAt',
      order: 'DESC',
    },
  ]);
  const { convertWeights } = useCompanyMeasurementUnits();
  const [orders, setOrders] = useState<GridOrders>([]);
  const columns = useYardOperationConsoleColumns({
    orders,
    columns: defaultColumns,
  });

  const materialContext = useContext(MaterialOrderContext);

  const onCloseCallback = () => {
    materialContext.setMaterial(undefined);
  };

  const haulingMaterials = useGetHaulingMaterialsQuery();

  const [variables, setVariables] = useState<
    GetOrdersIndexedWithYardConsoleAggregationQueryVariables
  >(() =>
    buildFetchVariables({
      activeTab: YardOperationConsoleTabs.InYard,
      currentSort,
      filter: [],
      query: '',
      perPage: ORDERS_PER_PAGE,
    }),
  );

  const debouncedError = debounce(() => {
    if (currentSort[0].field !== 'arrivedAt') {
      setCurrentSort([
        {
          field: 'arrivedAt',
          order: 'DESC',
        },
      ]);
      fetchQuery({
        variables: {
          ...variables,
          search: {
            ...variables.search,
            sort: [
              {
                arrivedAt: 'desc',
              },
            ],
          },
        },
      });
    }
    showError(t(`Coudn't fetch orders with selected options`));
  }, 100);

  const [
    fetchQuery,
    { data: indexedData, loading, error },
  ] = useGetOrdersIndexedWithYardConsoleAggregationLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      const materials = haulingMaterials?.data?.haulingMaterials?.data;

      const updatedItems = data.ordersIndexed.data?.map((item) => {
        const updatedItem = { ...item };

        if (materials) {
          const unitOfMeasurement = materials.find((material) => item.materialId === material.id)
            ?.units as UnitOfMeasurementType;

          if (unitOfMeasurement) {
            updatedItem.weightIn = convertKgToUom(
              item.weightIn ? item.weightIn : 0,
              unitOfMeasurement,
            );
            updatedItem.weightOut = convertKgToUom(
              item.weightOut ? item.weightOut : 0,
              unitOfMeasurement,
            );
            updatedItem.netWeight = convertKgToUom(
              item.netWeight ? item.netWeight : 0,
              unitOfMeasurement,
            );
          } else {
            updatedItem.weightIn = convertWeights(item.weightIn ? item.weightIn : 0);
            updatedItem.weightOut = convertWeights(item.weightOut ? item.weightOut : 0);
            updatedItem.netWeight = convertWeights(item.netWeight ? item.netWeight : 0);
          }
        }

        return updatedItem;
      });

      setOrders([...orders, ...(updatedItems || [])]);
    },
  });

  useEffect(() => {
    if (!indexedData && error) {
      debouncedError();
    }

    return () => debouncedError.cancel();
  }, [debouncedError, error, indexedData]);

  const total = indexedData?.ordersIndexed.total || 0;
  const consoleActivity = indexedData?.yardOperationConsoleActivity;

  useEffect(() => {
    // do fetch each time variables are changed
    fetchQuery({ variables });
    setRefetchYardOperationConsoleQuery(() => {
      return fetchQuery({ variables });
    });

    return setRefetchYardOperationConsoleQuery(() => {
      setOrders([]);
      fetchQuery({ variables });
    });
  }, [fetchQuery, variables]);

  const loadMore = useCallback(
    (perPage = ORDERS_PER_PAGE) => {
      setVariables((variables) => {
        let nextSize = perPage;
        const nextFrom = (variables.search?.from || 0) + (variables.search?.size || perPage);
        const nextTotal = nextFrom + nextSize;

        if (nextFrom >= total) {
          return variables;
        }

        if (nextTotal > total) {
          nextSize = total - nextFrom;
        }

        const nextVariables = { ...variables };
        nextVariables.search.from = nextFrom;
        nextVariables.search.size = nextSize;

        return nextVariables;
      });
    },
    [total, setVariables],
  );

  const onTableChange = useCallback(
    (action: string, tableState: DataTableState) => {
      setVariables((variables) => {
        switch (action) {
          case 'sort':
          case 'changePage':
          case 'changeRowsPerPage':
          case 'search':
          case 'resetFilters':
          case 'filterChange': {
            const { filterList, columns } = tableState;

            const filters = filterList.map((filterValue, index) => {
              const column = columns[index];

              return {
                field: column.name,
                value: filterValue,
                type: column.filterType,
              };
            });

            setOrders([]); // by default we treat each request as load more, this request is fresh start

            let updatedSort: SortInput[];

            if (tableState.sortOrder.name === 'hasWeightTicket') {
              updatedSort = [
                {
                  field: tableState.sortOrder.name,
                  order: tableState.sortOrder.direction,
                },
                {
                  // sort weight ticket by order.id
                  field: 'id',
                  order: tableState.sortOrder.direction,
                },
              ];
            } else {
              updatedSort = [
                {
                  field: tableState.sortOrder.name,
                  order: tableState.sortOrder.direction,
                },
              ];
            }

            setCurrentSort(updatedSort);

            return buildFetchVariables({
              activeTab: YardOperationConsoleTabs.InYard,
              perPage: ORDERS_PER_PAGE,
              currentSort: updatedSort,
              filter: compact(filters),
              query: tableState.searchText,
            });
          }

          default:
            return variables;
        }
      });
    },
    [buildFetchVariables, setOrders],
  );

  const openEditOrderForm = (order: any, onClose?: () => void, onSubmitted?: () => void) => {
    //   Reset Material context when a new Order is being open
    materialContext.material = undefined;
    openForm({
      form: (
        <EditOrder
          orderId={order.id}
          readOnly={order.status === OrderStatus.Finalized || order.status === OrderStatus.Invoiced}
          onSubmitted={onSubmitted}
        />
      ),
      anchor: 'left',
      onClose: onCloseCallback,
    });
  };

  const handleRowSelectionChange = (selection: any[]) => {
    if (!onRowsSelected) {
      return;
    }

    const [indexes, selectedOrders] = selection.reduce(
      (acc, selection) => {
        const { index } = selection;

        acc[0].push(index);
        acc[1].push(orders[index]);

        return acc;
      },
      [[], []],
    );

    onRowsSelected(indexes, selectedOrders);
  };

  const pageTitle = t('Yard Operation Console');

  useEffect(() => {
    if (weightTicket) {
      const orderIndex = orders.findIndex(({ id }) => weightTicket.id === id);

      if (orderIndex > -1) {
        const changedOrders = [...orders];
        changedOrders[orderIndex] = {
          ...changedOrders[orderIndex],
          ...weightTicket,
        };
        setOrders(changedOrders);
      }
      clearWeightTicket();
    }
  }, [weightTicket, orders, clearWeightTicket, setOrders]);

  return (
    <GeneralView title={title}>
      <PageTitleSetter pageTitle={pageTitle} />
      <DocumentTitleSetter title={pageTitle} showApplicationInfo={false} showCompanyInfo={false} />
      <Datatable
        title=""
        data={orders}
        columns={columns}
        loading={loading}
        components={{
          Checkbox: (
            props: MUIDataTableCheckboxProps & {
              onChange(event: ChangeEvent<{}>, checked: boolean): void;
            },
          ) => {
            return (
              <CheckBoxField
                className={classes.selectionCheckbox}
                name="selectionCheckbox"
                {...props}
              />
            );
          },
        }}
        options={{
          pagination: false,
          rowsPerPage: ORDERS_PER_PAGE,
          count: total,
          rowsSelected: selectedIndexes,
          filter: true,
          search: true,
          searchPlaceholder,
          onTableChange,
          sortOrder: {
            name: currentSort[0].field,
            direction: currentSort[0].order.toLowerCase() as 'asc' | 'desc',
          },
          selectableRows,
          selectableRowsHeader,
          selectableRowsHideCheckboxes,
          onRowSelectionChange: (_row, selection) => handleRowSelectionChange(selection),
          onRowClick: (rowData, rowMeta) => {
            const { rowIndex } = rowMeta;
            const order = orders[rowIndex];

            if (!order) {
              return;
            }

            if (orderStatuses.includes(order.status)) {
              showOrder({
                orderId: order.id,
                showChangeStatusActions: false,
                quickViewContainer: formContainer,
              });

              return;
            }

            openEditOrderForm(order);
          },
          customToolbar: (data) => (customToolbar ? customToolbar(data, consoleActivity) : null),
        }}
      />
      {indexedData && !loading && (
        <Waypoint
          onEnter={() => {
            if (total <= orders.length) {
              return;
            }

            loadMore();
          }}
        />
      )}
    </GeneralView>
  );
};

export default YardOperationConsoleGrid;
