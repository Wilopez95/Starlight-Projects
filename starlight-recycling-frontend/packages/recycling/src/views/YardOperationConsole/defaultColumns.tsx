import React, { useContext, useEffect, useMemo } from 'react';
import { compact } from 'lodash-es';
import { capitalize } from 'lodash/fp';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useTranslation } from '../../i18n';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';

import {
  orderStatuses,
  orderStatusLabelMapping,
  orderTypeTranslationMapping,
} from '../OrdersView/constant';
import Label from '../../components/Label';
import { FilterSearchValueField } from '../../components/Filter';
import { highlightColumns, YardOperationConsoleTabs } from './constants';
import { customerTruckTypeTranslationMapping } from '../../constants/mapping';
import {
  CustomerTruckTypes,
  GetOrdersIndexedWithYardConsoleAggregationQuery,
  OrderStatus,
  OrderType,
} from '../../graphql/api';
import { ColumnWithHighlightDef, useHighlight } from '../../hooks/useHighlight';
import { WeightTicketThumb } from './components/WeightTicketField/WeightTicketThumb';
import { useCompanyMeasurementUnits } from '../../hooks/useCompanyMeasurementUnits';
import { FilterSearchValueType } from '../../components/Datatable/fields/SearchValueField/Autocomplete';
import CustomerSearchField from '../../components/CustomerSearchField';
import FilterTextValueField from '../../components/Filter/Fields/FilterTextValueField';
import { PrintWeightTicketContext } from '../../components/PrintWeightTicket/PrintWeightTicket';
import { Trans } from '../../i18n';

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
    width: 250,
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  statusCol: {
    width: 110,
  },
  truckNumberCol: {
    width: 85,
  },
  icon: {
    width: '20px !important',
    height: '20px !important',
    '& svg': {
      width: 20,
      height: 20,
    },
  },
}));

interface ColumnsHookProps {
  activeTab: YardOperationConsoleTabs;
  openWeightTicketPreview: (id: number) => void;
}

interface WeightTicketCellProps {
  hasWeightTicket: boolean;
  status: OrderStatus;
  orderId: number;
  openWeightTicketPreview: ColumnsHookProps['openWeightTicketPreview'];
}

const WeightTicketCell: React.FC<WeightTicketCellProps> | null = ({
  openWeightTicketPreview,
  hasWeightTicket,
  orderId,
  status,
}) => {
  const classes = useStyles();
  const { fetchWeightTicket } = useContext(PrintWeightTicketContext);
  const statusToFetchWT = useMemo(
    () => [OrderStatus.Completed, OrderStatus.Approved, OrderStatus.Finalized].includes(status),
    [status],
  );

  useEffect(() => {
    if (!hasWeightTicket && statusToFetchWT) {
      fetchWeightTicket(orderId);
    }
  }, [hasWeightTicket, statusToFetchWT, fetchWeightTicket, orderId]);

  if (!hasWeightTicket) {
    return statusToFetchWT ? <CircularProgress className={classes.icon} /> : null;
  }

  return (
    <Box display="flex" flexWrap="nowrap">
      <Box display="flex" alignItems="center">
        <WeightTicketThumb orderId={orderId} />
      </Box>
      <Box display="flex" mr={1}>
        <Button
          color="primary"
          onClick={(event) => {
            event.stopPropagation();

            openWeightTicketPreview(orderId);
          }}
        >
          <Typography variant="body2">{orderId}</Typography>
        </Button>
      </Box>
    </Box>
  );
};

export const useDefaultColumns = ({
  activeTab,
  openWeightTicketPreview,
}: ColumnsHookProps): ColumnWithHighlightDef[] => {
  const classes = useStyles();
  const [t] = useTranslation();
  const { massTranslation } = useCompanyMeasurementUnits();

  const columns = compact([
    {
      name: 'customer.businessName',
      label: t('Customer'),
      options: {
        filter: false,
        setCellHeaderProps: () => ({ className: classes.businessNameCol }),
      },
    },
    {
      name: 'nonCommercialTruck.licensePlate',
      label: t('Plate Number'),
      options: {
        display: activeTab === YardOperationConsoleTabs.InYard,
        filter: false,
        setCellHeaderProps: () => ({ className: classes.truckNumberCol }),
      },
    },
    {
      name: 'customer.id',
      label: t('Customer'),
      options: {
        display: false,
        filter: true,
        filterName: 'customerId',
        filterType: 'multiselect',
        filterOptions: {
          filterInput: (props) => (
            <FilterSearchValueField
              {...props}
              SearchComponent={({
                onChange,
                multiple,
                value,
              }: {
                onChange?: (value: any) => void | undefined;
                multiple?: boolean;
                value?:
                  | string
                  | FilterSearchValueType
                  | (string | FilterSearchValueType)[]
                  | undefined;
              }) => {
                return (
                  <CustomerSearchField
                    value={value}
                    renderTags={() => null}
                    disableClearable={multiple}
                    onChange={(newValue: FilterSearchValueType) => {
                      onChange && onChange(newValue);
                    }}
                  />
                );
              }}
            />
          ),
        },
      },
    },
    {
      name: 'customerTruck.truckNumber',
      label: t('Truck #'),
      options: {
        filter: false,
        setCellHeaderProps: () => ({ className: classes.truckNumberCol }),
      },
    },
    {
      name: 'customerTruck.type',
      label: t('Truck Type'),
      options: {
        filter: false,
        customBodyRender: (value: CustomerTruckTypes) => customerTruckTypeTranslationMapping[value],
        setCellHeaderProps: () => ({ className: classes.statusCol }),
        setCellProps: () => ({ className: classes.noWrap }),
      },
    },
    {
      name: 'status',
      label: t('Status'),
      options: {
        display: activeTab === YardOperationConsoleTabs.Today,
        filter: false,
        setCellHeaderProps: () => ({ className: classes.statusCol }),
        setCellProps: () => ({ className: classes.noWrap }),
        customBodyRender: (value: OrderStatus) => {
          if (!orderStatuses.includes(value)) {
            return <Label variant="inactive">{t('In Progress')}</Label>;
          }

          return (
            <Label variant={orderStatusLabelMapping[value as keyof typeof orderStatusLabelMapping]}>
              <Trans>{capitalize(value)}</Trans>
            </Label>
          );
        },
      },
    },
    {
      name: 'type',
      label: t('Action'),
      options: {
        filter: true,
        filterType: 'checkbox',
        filterData: [OrderType.Dump, OrderType.Load].map((type) => ({
          label: orderTypeTranslationMapping[type],
          value: type,
        })),
        filterOptions: {
          autoApply: true,
        },
        customBodyRender: (value: OrderType) => orderTypeTranslationMapping[value],
        setCellHeaderProps: () => ({ className: classes.statusCol }),
        setCellProps: () => ({ className: classes.noWrap }),
      },
    },
    {
      name: 'WONumber',
      label: t('WO#'),
      options: {
        filter: true,
        filterType: 'custom',
        filterOptions: {
          filterInput: FilterTextValueField,
        },
      },
    },
    ...(activeTab === YardOperationConsoleTabs.OnTheWay
      ? []
      : ([
          {
            name: 'arrivedAt',
            label: t('Time In'),
            options: {
              filter: false,
              setCellHeaderProps: () => ({ className: classes.statusCol }),
              setCellProps: () => ({ className: classes.noWrap }),
              customBodyRender: (value) => {
                return `→ ${t('time', { value })}`;
              },
            },
          },
          {
            name: 'weightIn',
            label: `${t('Weight In')}`,
            options: {
              filter: false,
              customBodyRender: (value: number) => (value ? `→ ${value}` : '-'),
              setCellHeaderProps: () => ({ className: classes.statusCol }),
              setCellProps: () => ({ className: classes.noWrap }),
              hint: massTranslation,
            },
          },
          {
            name: 'graded',
            label: t('Graded'),
            options: {
              filter: true,
              filterType: 'radio',
              filterData: [
                {
                  label: t('Yes'),
                  value: 'true',
                },
                {
                  label: t('No'),
                  value: 'false',
                },
              ],
              filterOptions: {
                autoApply: true,
              },
              customBodyRender: (value, { rowIndex, tableData, columnIndex }) => {
                const rowData = (tableData[rowIndex] as unknown) as Array<
                  string | number | boolean
                >;

                if (!rowData) {
                  return;
                }
                const type = rowData[5];

                if (type !== OrderType.Dump) {
                  return;
                }

                return <CheckBoxField disabled checked={rowData[columnIndex] as boolean} />;
              },
            },
          },
          {
            name: 'weightOut',
            label: `${t('Weight Out')}`,
            options: {
              filter: false,
              customBodyRender: (value: number) => (value ? `← ${value}` : '-'),
              setCellHeaderProps: () => ({ className: classes.statusCol }),
              setCellProps: () => ({ className: classes.noWrap }),
              hint: massTranslation,
            },
          },
          {
            name: 'netWeight',
            label: `${t('Net Weight')}`,
            options: {
              filter: false,
              customBodyRender: (value) => (value ? `${value}` : '-'),
              setCellProps: () => ({ className: classes.noWrap }),
              hint: massTranslation,
            },
          },
          {
            name: 'hasWeightTicket',
            label: t('Ticket #'),
            options: {
              sort: true,
              filter: false,
              setCellProps: () => ({ className: classes.noWrap }),
              customBodyRender: (value, { rowIndex, tableData }) => {
                const rowData = (tableData[rowIndex] as unknown) as Array<
                  string | number | boolean
                >;

                if (!rowData) {
                  return null;
                }

                const status = rowData[4] as OrderStatus;
                const orderId = rowData[rowData.length - 1] as number;

                return (
                  <WeightTicketCell
                    hasWeightTicket={value}
                    status={status}
                    orderId={orderId}
                    openWeightTicketPreview={openWeightTicketPreview}
                  />
                );
              },
            },
          },
          {
            name: 'id',
            options: {
              display: false,
              filter: false,
            },
          },
        ] as ColumnWithHighlightDef[])),
  ] as ColumnWithHighlightDef[]);

  return columns;
};

export const useYardOperationConsoleColumns = ({
  orders,
  columns,
}: {
  orders: GetOrdersIndexedWithYardConsoleAggregationQuery['ordersIndexed']['data'];
  columns: ColumnWithHighlightDef[];
}) => {
  return useHighlight({
    defaultColumns: columns,
    data: orders,
    highlightColumns,
  });
};
