import React from 'react';
import { TFunction } from 'i18next';
import moment, { Moment } from 'moment';
import { Box, Button } from '@material-ui/core';
import { capitalize, compact, isEmpty } from 'lodash-es';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';
import cs from 'classnames';

import {
  orderStatuses,
  orderStatusLabelMapping,
  orderTypeTranslationMapping,
  paymentMethodTranslationMapping,
} from './constant';
import {
  GetOrdersIndexedWithStatusAggregationQuery,
  OrderStatus,
  OrderType,
  PaymentMethodType,
  SortInput,
} from '../../graphql/api';
import {
  GetFilterByFieldFuncType,
  getSearchBody,
  GetSortFuncFilterType,
} from '../../components/Filter/util';
import Label from '../../components/Label';
import { MaterialFilter } from './filters/MaterialFilter';
import { FilterSearchValueField } from '../../components/Filter';
import { ColumnWithHighlightDef } from '../../hooks/useHighlight';
import CustomerSearchField from '../../components/CustomerSearchField';
import UserSearchField from '../../components/UserSearchField';
import { FilterSearchValueType } from '../../components/Datatable/fields/SearchValueField/Autocomplete';
import { MUIDataTableMeta } from 'mui-datatables';
import { WeightTicketThumb } from '../YardOperationConsole/components/WeightTicketField/WeightTicketThumb';
import FilterTextValueField from '../../components/Filter/Fields/FilterTextValueField';
import { ConvertWeights } from '../../hooks/useCompanyMeasurementUnits';
import {
  ConvertMaterialWeights,
  getUomTypeFromString,
} from '../../hooks/useUnitOfMeasurementConversion';

export const ORDERS_PER_PAGE = 25;

export type RangeFieldType = {
  from: Moment | string;
  to: Moment | string;
};

export interface BuildFetchVariables {
  id: string;
  status?: OrderStatus;
  perPage: number;
  page?: number;
  search?: string | null;
  currentSort: SortInput;
  filters: { field: string; value: any }[];
  owner?: string;
}

export const getOrdersFilterByField: GetFilterByFieldFuncType = (field, value) => {
  if (isEmpty(value)) {
    return undefined;
  }
  switch (field) {
    case 'type':
    case 'owner':
    case 'paymentMethod':
    case 'PONumber':
    case 'status':
    case 'customerTruck.type':
      return {
        terms: {
          [`${field}.keyword`]: value,
        },
      };
    case 'graded':
      return {
        term: {
          [field]: value[0] === 'true',
        },
      };
    case 'balance':
    case 'createdAt':
      const { from, to } = value[0] as RangeFieldType;

      const gte = moment.isMoment(from) ? moment(from).startOf('day').format() : from;
      const lte = moment.isMoment(to) ? moment(to).endOf('day').format() : to;

      return {
        range: {
          [field]: {
            gte,
            lte,
          },
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

export const buildFetchVariables = ({
  id,
  status,
  currentSort,
  perPage = ORDERS_PER_PAGE,
  page = 0,
  search,
  filters,
  owner,
}: BuildFetchVariables) => {
  const filterParams = [...filters];

  if (owner) {
    filterParams.push({
      field: 'owner',
      value: [owner],
    });
  }

  if (Number(id)) {
    filterParams.push({
      field: 'customer.id',
      value: [Number(id)],
    });
  }

  const aggregationFilters = [
    ...filterParams,
    {
      field: 'status.keyword',
      value: orderStatuses.map((status) => status),
    },
  ];

  if (status) {
    filterParams.push({
      field: 'status.keyword',
      value: [status],
    });
  } else {
    filterParams.push({
      field: 'status.keyword',
      value: orderStatuses.map((status) => status),
    });
  }

  const getAggregationSearchBody = () => {
    const { query } = getSearchBody({
      perPage,
      currentSort: currentSort,
      query: search,
      filter: aggregationFilters,
      getSort: getOrdersSort,
      getFilterByField: getOrdersFilterByField,
    });

    return {
      query,
      aggs: {
        status: {
          terms: { field: 'status.keyword' },
        },
      },
    };
  };

  return {
    search: getSearchBody({
      page,
      perPage,
      currentSort,
      query: search,
      filter: filterParams,
      getSort: getOrdersSort,
      getFilterByField: getOrdersFilterByField,
    }),
    aggregations: getAggregationSearchBody(),
  };
};

export const getOrdersColumns = ({
  status,
  customerId,
  statusCellHeaderClassName,
  orders,
  t,
  openWeightTicketPreview,
  classes,
  massTranslation,
  convertWeights,
  myOrdersPage,
  convertMaterialWeights,
}: {
  status?: string;
  customerId?: string | number;
  statusCellHeaderClassName?: string;
  orders: GetOrdersIndexedWithStatusAggregationQuery['ordersGrid']['data'];
  t: TFunction;
  openWeightTicketPreview: (id: number) => void;
  classes?: {
    rightAlign?: string;
    leftAlign?: string;
    cellContent?: string;
  };
  convertWeights: ConvertWeights;
  massTranslation: string;
  convertMaterialWeights?: ConvertMaterialWeights;
  myOrdersPage?: boolean;
}): ColumnWithHighlightDef[] =>
  compact([
    {
      name: 'createdAt',
      label: t('Order Date'),
      options: {
        filterType: 'daterange',
        customBodyRender: (value: string) => t('dateLabel', { date: new Date(value) }),
      },
    },
    {
      name: 'status',
      label: t('Status'),
      options: {
        display: !status,
        filter: false,
        setCellHeaderProps: () => ({ className: statusCellHeaderClassName }),
        customBodyRender: (value: OrderStatus) => (
          <Label variant={orderStatusLabelMapping[value as keyof typeof orderStatusLabelMapping]}>
            {capitalize(value)}
          </Label>
        ),
      },
    },
    {
      name: 'type',
      label: t('Action'),
      options: {
        filter: true,
        filterType: 'checkbox',
        filterData: [OrderType.Dump, OrderType.Load, OrderType.NonService].map((type) => ({
          label: orderTypeTranslationMapping[type],
          value: type,
        })),
        customBodyRender: (value: OrderType) => orderTypeTranslationMapping[value],
      },
    },
    {
      name: 'WONumber',
      label: t('WO#'),
      options: { filter: false },
    },
    {
      name: 'netWeight',
      label: `${t('Net Weight')} (${massTranslation})`,
      options: {
        filter: false,
        customBodyRender: (value, { rowIndex }) => {
          const order = orders[rowIndex];

          if (!order || order.type === OrderType.NonService) {
            return;
          }

          const materialUnit = order.material?.units;

          let weight = convertWeights(+value);

          if (materialUnit && convertMaterialWeights) {
            weight = convertMaterialWeights(value, getUomTypeFromString(materialUnit));
          }

          return <span className={cs(classes?.rightAlign, classes?.cellContent)}>{weight}</span>;
        },
      },
    },
    {
      name: 'paymentMethod',
      label: t('Payment Method'),
      options: {
        display: false,
        filter: true,
        filterType: 'checkbox',
        filterData: [
          PaymentMethodType.Cash,
          PaymentMethodType.Check,
          PaymentMethodType.CreditCard,
          PaymentMethodType.OnAccount,
        ].map((option) => ({ label: paymentMethodTranslationMapping[option], value: option })),
      },
    },
    {
      name: 'owner',
      label: t('User Name'),
      options: {
        display: false,
        filter: !myOrdersPage,
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
                  <UserSearchField
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
      name: 'material.description',
      label: t('Material'),
      options: {
        filter: true,
        filterName: 'materialId',
        filterType: 'multiselect',
        filterOptions: {
          filterInput: (props) => (
            <FilterSearchValueField
              {...props}
              SearchComponent={({ onChange }: { onChange?: (value: any) => void | undefined }) => (
                <MaterialFilter name={props.name} onChange={onChange} />
              )}
            />
          ),
        },
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
        customBodyRender: (value, { rowIndex }) => {
          const order = orders[rowIndex];

          if (!order || order.type !== OrderType.Dump) {
            return;
          }

          return <CheckBoxField checked={value} />;
        },
      },
    },
    {
      name: 'id',
      label: t('Ticket #'),
      options: {
        sort: true,
        filter: false,
        customBodyRender: (value: any, tableMeta: MUIDataTableMeta) => {
          const { rowIndex } = tableMeta;
          const order = orders[rowIndex];

          if (!value || !order?.id || order.type === OrderType.NonService) {
            return null;
          }

          return (
            <Box component="span" display="flex" flexWrap="nowrap">
              <Box display="flex" alignItems="center">
                <WeightTicketThumb orderId={order.id} />
              </Box>
              <Box display="flex" mr={1}>
                <Button
                  color="primary"
                  onClick={(event) => {
                    event.stopPropagation();

                    openWeightTicketPreview(order.id);
                  }}
                >
                  {order.id}
                </Button>
              </Box>
            </Box>
          );
        },
      },
    },
    {
      name: 'customer.businessName',
      label: t('Customer'),
      options: {
        filter: false,
      },
    },
    !customerId && {
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
      name: 'grandTotal',
      label: t(`Total, $t(currency)`),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => (
          <span className={cs(classes?.rightAlign, classes?.cellContent)}>{value}</span>
        ),
      },
    },
    {
      name: 'PONumber',
      label: t('PO Number'),
      options: {
        display: false,
        filter: true,
        filterType: 'custom',
        filterOptions: {
          filterInput: FilterTextValueField,
        },
      },
    },
  ]);

export const getOrdersSort: GetSortFuncFilterType = (field, order) => {
  switch (field) {
    case 'WONumber':
    case 'PONumber':
    case 'type':
    case 'material.description':
    case 'customer.businessName':
    case 'customerTruck.truckNumber':
    case 'customerTruck.type':
    case 'status':
      return {
        [`${field}.keyword`]: order,
      };
    default:
      return { [field]: order };
  }
};

export const getSortName = (field: string) => {
  if (
    [
      'WONumber',
      'PONumber',
      'type',
      'material.description',
      'customer.businessName',
      'customerTruck.truckNumber',
      'customerTruck.type',
      'status',
    ].includes(field)
  ) {
    return `${field}.keyword`;
  }

  return field;
};
