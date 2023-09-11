import React, { FC } from 'react';
import { isArray, isObject, keyBy } from 'lodash-es';
import SearchFieldAutocomplete from '../../../SearchFieldAutocomplete';

export interface FilterSearchValueType {
  label: string;
  value: unknown;
}

export interface AutocompleteProps {
  multiple?: boolean;
  value?: (FilterSearchValueType | string)[] | string | FilterSearchValueType;
  className?: string;
  onChange?(value: FilterSearchValueType[]): void;
  filterData: (FilterSearchValueType | string)[];
}

export const Authocomplete: FC<AutocompleteProps> = ({
  multiple,
  value,
  onChange,
  className,
  filterData,
}) => {
  const options = (filterData || []).map((v) =>
    !isObject(v) ? { label: `${v || ''}`, value: v } : v,
  );
  const optionsByKey = keyBy(options, 'value');
  const values = isArray(value)
    ? value.map((v) => (isObject(v) ? v.value : value)).filter((v: any) => !!optionsByKey[v])
    : value;

  return (
    <SearchFieldAutocomplete
      options={options}
      multiple={multiple}
      disableClearable={multiple}
      value={values}
      className={className}
      onChange={(value: FilterSearchValueType[]) => {
        if (onChange) {
          onChange(value);
        }
      }}
      renderTags={() => null}
    />
  );
};
