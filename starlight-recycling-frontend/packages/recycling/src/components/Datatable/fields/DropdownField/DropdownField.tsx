import React, { FC } from 'react';
import TextField from '@starlightpro/common/components/TextField';
import { SelectOption } from '@starlightpro/common';

import { DatatableFilterDisplayProps } from '../../types';
import { isObject } from 'lodash-es';
import { useField } from 'react-final-form';

export interface FilterValueProps extends DatatableFilterDisplayProps {}

export const DropdownField: FC<FilterValueProps> = ({ column: { filterData = [] }, name }) => {
  const {
    input: { value: filterValue, onChange },
  } = useField(name);

  const value = filterValue?.value ?? '';

  const menuOptions = filterData.map((data) => {
    if (isObject(data)) {
      return data;
    }

    return {
      label: `${data}`,
      value: data,
    };
  });

  return (
    <TextField
      select
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    >
      {menuOptions.map(({ label, value }: any) => (
        <SelectOption key={value} value={value}>
          {label}
        </SelectOption>
      ))}
    </TextField>
  );
};
