import React, { FC, useCallback } from 'react';

import i18n from '../../../i18n';

import { OrderType } from '../../../graphql/api';
import { orderTypeTranslationMapping } from '../../../views/OrdersView/constant';
import CommonFilter from '../CommonFilter';

const fieldOptions = [
  {
    field: 'type',
    label: i18n.t('Action'),
  },
  {
    field: 'material.id',
    label: i18n.t('Material'),
  },
  {
    field: 'graded',
    label: i18n.t('Graded'),
  },
  {
    field: 'createdAt',
    label: i18n.t('Order Date'),
  },
  {
    field: 'customer.id',
    label: i18n.t('Customer'),
  },
  {
    field: 'PONumber',
    label: i18n.t('PO#'),
  },
  {
    field: 'owner.id',
    label: i18n.t('User Name'),
  },
  {
    field: 'paymentMethod',
    label: i18n.t('Payment Method'),
  },
  {
    field: 'balance',
    label: i18n.t('Balance'),
  },
];

export const orderTypeMenuOptions = [OrderType.Dump, OrderType.Load, OrderType.NonService].map(
  (type) => ({
    label: orderTypeTranslationMapping[type],
    value: type,
  }),
);

export interface FilterComponentProps {
  index: number;
  name: string;
  filterType: string;
  filterOptions: unknown[];
  value: unknown[];
}

export const FilterComponent: FC<FilterComponentProps> = ({
  name,
  // index,
  // filterType,
  // filterOptions,
  // value,
}) => {
  // const classes = useStyles();

  const renderValue = useCallback(() => {
    return null;
  }, []);

  return <CommonFilter name={name} fieldOptions={fieldOptions} renderValue={renderValue} />;
};

export default FilterComponent;
