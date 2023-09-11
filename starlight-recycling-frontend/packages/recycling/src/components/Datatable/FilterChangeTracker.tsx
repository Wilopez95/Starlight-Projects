import { FormState } from 'final-form';
import React, { FC, useCallback } from 'react';
import { FormSpy, useForm } from 'react-final-form';
import { DataTableColumnState, DataTableState, FilterFormValue } from './types';
import { isEqual } from 'lodash-es';
import { isArray } from 'lodash/fp';

export interface FilterChangeTrackerProps {
  columns: DataTableColumnState[];
  searchText?: string;
  filterList?: DataTableState['filterList'];
  filterUpdate?: (...args: any) => any;
  handleSearch(value: string): void;
}

export const FilterChangeTracker: FC<FilterChangeTrackerProps> = ({
  filterList,
  columns,
  searchText: searchValue,
}) => {
  const form = useForm();
  const onAutoApply = useCallback<(formState: FormState<FilterFormValue>) => null>(
    ({ values }) => {
      const { searchText, fields } = values;

      if (searchValue !== searchText) {
        form.submit();

        return null;
      }

      if (!filterList) {
        return null;
      }

      const hasChange = fields.some(({ columnIndex, value }) => {
        const currentValue = filterList[columnIndex];
        const column = columns[columnIndex];
        let nextValue = value;

        // NOTE: this is correct, isArray is needed!
        if (!isArray(nextValue)) {
          if (nextValue === null) {
            nextValue = [];
          } else {
            nextValue = [nextValue];
          }
        }

        return column?.filterOptions?.autoApply && !isEqual(nextValue, currentValue);
      });

      if (hasChange) {
        form.submit();
      }

      return null;
    },
    [columns, filterList, searchValue, form],
  );

  return <FormSpy<FilterFormValue> subscription={{ values: true }} onChange={onAutoApply} />;
};
