import React, { FC, useCallback } from 'react';
import { RadioGroupField, RadioGroupItem, TextField, SelectOption } from '@starlightpro/common';
import i18n, { Trans } from '../../../i18n';

import { makeStyles } from '@material-ui/core/styles';
import CommonFilter from '../CommonFilter';
import { CommonFilterBaseProps } from '../index';
import { OrderStatus, CustomerTruckTypes, OrderType } from '../../../graphql/api';
import { orderTypeMenuOptions } from '../OrderFilter';
import FilterSelectValueField from '../Fields/FilterSelectValueField';
import { customerTruckTypeTranslationMapping } from '../../../constants/mapping';
import { orderStatusMapping } from '../../../views/OrdersView/constant';

const useStyles = makeStyles(() => ({
  radioGroup: {
    flexDirection: 'row',
  },
  status: {
    width: 150,
  },
}));

const fieldOptions = [
  {
    label: i18n.t('Status'),
    field: 'status',
  },
  {
    label: i18n.t('Action'),
    field: 'type',
  },
  {
    label: i18n.t('Truck Type'),
    field: 'customerTruck.type',
  },
  {
    label: i18n.t('Graded'),
    field: 'graded',
  },
];

const orderStatusOptions = [
  {
    label: i18n.t('Completed'),
    value: orderStatusMapping[OrderStatus.Completed],
  },
  {
    label: i18n.t('In Progress'),
    value: 'inProgress',
  },
].map((option) => (
  <SelectOption key={option.label} value={option.value}>
    {option.label}
  </SelectOption>
));

const orderTypeSelectOptions = orderTypeMenuOptions
  .filter((f) => f.value !== OrderType.NonService)
  .map((option) => (
    <SelectOption key={option.label} value={option.value}>
      {option.label}
    </SelectOption>
  ));

const customerTruckSelectOptions = [
  {
    label: customerTruckTypeTranslationMapping[CustomerTruckTypes.Rolloff],
    value: CustomerTruckTypes.Rolloff,
  },
  {
    label: customerTruckTypeTranslationMapping[CustomerTruckTypes.Tractortrailer],
    value: CustomerTruckTypes.Tractortrailer,
  },
  {
    label: customerTruckTypeTranslationMapping[CustomerTruckTypes.Dumptruck],
    value: CustomerTruckTypes.Dumptruck,
  },
];

const selectOptionsFieldNameMapping = {
  type: orderTypeSelectOptions,
  status: orderStatusOptions,
};

export interface YardOperationConsoleFilterProps extends CommonFilterBaseProps {}

export const YardOperationConsoleFilter: FC<YardOperationConsoleFilterProps> = ({ name }) => {
  const classes = useStyles();
  const valueName = `${name}.value`;

  const renderValue = useCallback(
    (field: string) => {
      switch (field) {
        case 'status':
        case 'type':
          return (
            <TextField name={valueName} select classes={{ inputBaseInput: classes.status }}>
              {selectOptionsFieldNameMapping[field]}
            </TextField>
          );
        case 'customerTruck.type':
          return (
            <FilterSelectValueField
              name={valueName}
              menuOptions={customerTruckSelectOptions}
              max={2}
            />
          );
        case 'graded':
          return (
            <RadioGroupField name={valueName} classes={{ groupRoot: classes.radioGroup }}>
              <RadioGroupItem color="primary" value={'true'} label={<Trans>Yes</Trans>} />
              <RadioGroupItem color="primary" value={'false'} label={<Trans>No</Trans>} />
            </RadioGroupField>
          );
        default:
          return null;
      }
    },
    [classes.radioGroup, classes.status, valueName],
  );

  return <CommonFilter name={name} fieldOptions={fieldOptions} renderValue={renderValue} />;
};

export default YardOperationConsoleFilter;
