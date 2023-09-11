import React, { FC, useMemo } from 'react';
import { TextField, SelectOption } from '@starlightpro/common';
import { Field, useField } from 'react-final-form';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { CommonFilterBaseProps, FilterFormValues } from '../index';

const useStyles = makeStyles(({ spacing, palette }) => ({
  field: {
    width: 248,
    marginRight: spacing(3),
  },
  value: {},
  input: {
    width: 260,
  },
  user: {},
  radioGroup: {
    flexDirection: 'row',
  },
  midLine: {
    margin: spacing(1, 2, 0, 2),
  },
  chip: {
    backgroundColor: palette.grey[100],
    width: 30,
    height: 30,
  },
}));

export interface CommonFilterProps extends CommonFilterBaseProps {
  fieldOptions: { field: string; label: string }[];
  renderValue(field: string): React.ReactNode;
}

export const CommonFilter: FC<CommonFilterProps> = ({ name, fieldOptions, renderValue }) => {
  const classes = useStyles();
  const {
    input: { value: filters },
  } = useField<FilterFormValues['fields']>('fields', { subscription: { value: true } });

  const fieldName = `${name}.field`;
  const valueName = `${name}.value`;
  const {
    input: { value: selectedFilterValue },
  } = useField(fieldName, { subscription: { value: true } });

  const filterOptionElements = useMemo(() => {
    const selectedFilters = filters.map((filter) => filter.field);

    return fieldOptions
      .filter((option) => {
        return !(selectedFilters.includes(option.field) && selectedFilterValue !== option.field);
      })
      .map((option) => (
        <SelectOption key={option.field} value={option.field}>
          {option.label}
        </SelectOption>
      ));
  }, [fieldOptions, filters, selectedFilterValue]);

  return (
    <Box display="flex">
      <Box className={classes.field}>
        <Field name={valueName}>
          {({ input }) => (
            <TextField
              name={fieldName}
              select
              fullWidth
              onChange={() =>
                input.onChange({
                  target: {
                    name: input.name,
                    value: undefined,
                  },
                })
              }
            >
              {filterOptionElements}
            </TextField>
          )}
        </Field>
      </Box>
      <Box className={classes.value}>
        <Field name={fieldName}>{({ input }) => renderValue(input.value)}</Field>
      </Box>
    </Box>
  );
};

export default CommonFilter;
