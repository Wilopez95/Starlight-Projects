import React, { FC, useCallback } from 'react';
import { RadioGroupField, RadioGroupItem } from '@starlightpro/common';
import { Field } from 'react-final-form';
import { Trans, useTranslation } from '../../../i18n';

import i18n from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import { OrderType } from '../../../graphql/api';
import { orderTypeTranslationMapping } from '../../../views/OrdersView/constant';
import Box from '@material-ui/core/Box';
import DateField from '../../FinalForm/DateField';
import CommonFilter from '../CommonFilter';
import { CommonFilterBaseProps } from '../index';

const useStyles = makeStyles(({ spacing }) => ({
  radioGroup: {
    flexDirection: 'row',
  },
  midLine: {
    margin: spacing(1, 2, 0, 2),
  },
}));

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

export interface OrderFilterProps extends CommonFilterBaseProps {}

export const OrderFilter: FC<OrderFilterProps> = ({ name }) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const valueName = `${name}.value`;

  const renderValue = useCallback(
    (field: string) => {
      switch (field) {
        case 'paymentMethod':
          break;
        case 'customer.id':
        case 'owner.id':
        case 'material.id':
          break;
        case 'graded':
          return (
            <RadioGroupField name={valueName} classes={{ groupRoot: classes.radioGroup }}>
              <RadioGroupItem color="primary" value={'true'} label={<Trans>Yes</Trans>} />
              <RadioGroupItem color="primary" value={'false'} label={<Trans>No</Trans>} />
            </RadioGroupField>
          );
        case 'createdAt':
          return (
            <Box display="flex">
              <Field name={`${valueName}.to`} subscription={{ value: true }}>
                {({ input: { value } }) => (
                  <DateField
                    maxDate={value || undefined}
                    name={`${valueName}.from`}
                    placeholder={t('From')}
                  />
                )}
              </Field>
              <Box className={classes.midLine}>&#8212;</Box>
              <Field name={`${valueName}.from`} subscription={{ value: true }}>
                {({ input: { value } }) => (
                  <DateField
                    minDate={value || undefined}
                    name={`${valueName}.to`}
                    placeholder={t('To')}
                  />
                )}
              </Field>
            </Box>
          );
        case 'PONumber':
          break;
      }
    },
    [classes.midLine, classes.radioGroup, t, valueName],
  );

  return <CommonFilter name={name} fieldOptions={fieldOptions} renderValue={renderValue} />;
};

export default OrderFilter;
