import React, { FC, memo } from 'react';
import { Box, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { SelectOption, TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import { Field } from 'react-final-form';
import { DataTableColumnState, FilterField as IFilterField } from '../types';
import { Filter } from '../../Filter/Filter';
import DisplayFilter from '../DisplayFilter';
import { MUIDataTableOptions } from 'mui-datatables';

export interface IFilterFieldProps {
  name: string;
  index: number;
  availableFilters: Filter[];
  filter?: Filter;
  column?: DataTableColumnState;
  options: MUIDataTableOptions;
}

const useStyles = makeStyles(
  ({ spacing }) => ({
    deleteIcon: {
      top: 3,
      marginRight: spacing(1),
    },
    field: {
      width: 248,
      marginRight: spacing(3),
    },
    value: {
      display: 'flex',
    },
  }),
  { name: 'FilterField' },
);

export const FilterField: FC<IFilterFieldProps> = memo(
  ({ name, index, availableFilters, filter, column, options }) => {
    const classes = useStyles();

    return (
      <Box display="flex" alignItems="flex-start" key={index}>
        <Field<IFilterField[]> name="fields" subscription={{ value: true }}>
          {({ input: { value: fields, onChange } }) => (
            <>
              <IconButton
                disabled={fields.length <= 1}
                tabIndex={0}
                size="small"
                aria-label="remove"
                className={classes.deleteIcon}
                onClick={() =>
                  onChange({
                    target: {
                      name: 'fields',
                      value: fields.filter((_, i) => i !== index),
                    },
                  })
                }
              >
                <DeleteIcon />
              </IconButton>

              <Box display="flex">
                <Box className={classes.field}>
                  <TextField
                    tabIndex={2}
                    select
                    fullWidth
                    name={`${name}.columnIndex`}
                    data-cy="Select Filter"
                    onChange={() => {
                      onChange({
                        target: {
                          name: 'fields',
                          value: fields.map(({ columnIndex, value: itemValue }, i) => ({
                            columnIndex,
                            value: i === index ? null : itemValue,
                          })),
                        },
                      });
                    }}
                  >
                    <SelectOption disabled value={-1}>
                      <Trans>Select Filter</Trans>
                    </SelectOption>
                    {filter && <SelectOption value={filter.index}>{filter.label}</SelectOption>}
                    {availableFilters.map(({ index, label }) => (
                      <SelectOption key={index} value={index} data-cy={label}>
                        {label}
                      </SelectOption>
                    ))}
                  </TextField>
                </Box>
                <Box className={classes.value}>
                  {column && (
                    <DisplayFilter name={name} options={options} column={column} index={index} />
                  )}
                </Box>
              </Box>
            </>
          )}
        </Field>
      </Box>
    );
  },
);
