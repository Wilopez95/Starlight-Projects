import { Box } from '@material-ui/core';
import React, { FC, memo } from 'react';
import {
  CheckboxField,
  DateRangeField,
  DropdownField,
  RadioField,
  RangeField,
  SearchValueField,
} from '../fields';
import { DataTableColumnState, ExtendedFilterTypes } from '../types';
import { ChipsField } from '../fields/ChipsField';
import { makeStyles } from '@material-ui/core/styles';
import { FilterSearchValueField } from '../../Filter';

import { FilterType, MUIDataTableOptions } from 'mui-datatables';
import { FilterInputProps } from '../../Filter/Filter';
import { Field } from 'react-final-form';

export interface DisplayFilterProps {
  name: string;
  options: MUIDataTableOptions;
  column: DataTableColumnState;
  index: number;
}

const actions = new Map<ExtendedFilterTypes, FC<FilterInputProps>>();

actions.set('range', RangeField);
actions.set('checkbox', CheckboxField);
actions.set('multiselect', SearchValueField);

const useStyles = makeStyles(
  () => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  }),
  {
    name: 'DisplayFilter',
  },
);

export const DisplayFilter = memo<DisplayFilterProps>(({ name, options, column }) => {
  const classes = useStyles();
  const valueName = `${name}.value`;
  const columnIndexName = `${name}.columnIndex`;
  const { filterType: columnFilterType, filterData, filterOptions, filter } = column;
  const filterType: ExtendedFilterTypes = columnFilterType || options.filterType;
  const FilterFormControl = filterOptions?.filterInput;

  if (filterType === 'daterange') {
    return <DateRangeField name={name} column={column} />;
  }

  if (filterType === 'radio') {
    return <RadioField name={name} column={column} />;
  }

  if (filterType === 'dropdown') {
    return <DropdownField name={name} column={column} />;
  }

  if (filterType === 'range' && !filterOptions?.filterInput) {
    return <RangeField name={name} />;
  }

  const buildFormControl = () => {
    if (FilterFormControl) {
      return <FilterFormControl name={valueName} filterData={filterData} />;
    }

    if (actions.has(filterType)) {
      const FormControl = actions.get(filterType)!;

      return <FormControl name={valueName} filterData={filterData} />;
    }

    return <FilterSearchValueField name={valueName} filterData={filterData} />;
  };

  const renderMultiSelectableValuesAsChips = () => {
    if (!filter || ['dropdown', 'radio', 'daterange', 'range'].includes(filterType as FilterType)) {
      return null;
    }

    return (
      <ChipsField
        name={valueName}
        filterData={filterData}
        displayCustomChip={filterOptions?.displayCustomChip}
      />
    );
  };

  return (
    <Box className={classes.root}>
      {renderMultiSelectableValuesAsChips()}
      <Field<number> name={columnIndexName} subscription={{ value: true }}>
        {({ input: { value } }) => {
          if (value !== -1) {
            return buildFormControl();
          }
        }}
      </Field>
    </Box>
  );
});
