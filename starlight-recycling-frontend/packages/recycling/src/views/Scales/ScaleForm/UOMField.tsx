import React, { FC } from 'react';
import { ScaleUnitOfMeasurement } from '../../../graphql/api';
import { useField } from 'react-final-form';
import { SelectOption } from '@starlightpro/common';
import { LineTextField } from '@starlightpro/common';

export interface UOMFieldProps {
  name: string;
  label?: JSX.Element | string;
}

export interface UOMOption {
  label: string;
  value: ScaleUnitOfMeasurement;
}

export const UOMField: FC<UOMFieldProps> = (props) => {
  let {
    input: { value: selectedUOMValue },
  } = useField(props.name, { subscription: { value: true } });

  const options: UOMOption[] = [
    {
      label: 'Kilograms',
      value: ScaleUnitOfMeasurement.Kilograms,
    },
    {
      label: 'Pounds',
      value: ScaleUnitOfMeasurement.Pounds,
    },
    {
      label: 'Short Tons',
      value: ScaleUnitOfMeasurement.ShortTons,
    },
    {
      label: 'Long Tons',
      value: ScaleUnitOfMeasurement.LongTons,
    },
    {
      label: 'Metric Tons',
      value: ScaleUnitOfMeasurement.MetricTons,
    },
  ];

  return (
    <LineTextField
      select
      name={props.name}
      data-cy="Scale Unit of Measurement Input"
      SelectProps={{ MenuProps: { 'data-cy': 'Unit of Measurement Input Select' } as any }}
      label={props.label}
      required
      fullWidth
      onChange={(event) => {
        const value: ScaleUnitOfMeasurement = event.target.value as ScaleUnitOfMeasurement;
        selectedUOMValue = value;
      }}
      mapValues={{
        mapFieldValueToFormValue: (givenValue: ScaleUnitOfMeasurement) => {
          return options.find(({ value }) => value === givenValue)?.value;
        },
        mapFormValueToFieldValue: () => {
          return selectedUOMValue;
        },
      }}
    >
      {options.map((row) => {
        return (
          <SelectOption key={row.value} value={row.value} selected={row.value === selectedUOMValue}>
            {row.label}
          </SelectOption>
        );
      })}
    </LineTextField>
  );
};
