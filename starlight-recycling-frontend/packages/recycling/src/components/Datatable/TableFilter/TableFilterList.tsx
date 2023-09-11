import { makeStyles } from '@material-ui/core/styles';
import { Trans } from '../../../i18n';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { Box, Button, Collapse, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Filter } from '../../Filter/Filter';
import { compact, isEmpty, isNumber, isString, some } from 'lodash-es';
import { Field, FormSpy, useField, useForm } from 'react-final-form';
import FilterField from '../FilterField';
import { MUIDataTableFilter, MUIDataTableFilterList } from 'mui-datatables';
import { DataTableColumnState, DataTableState, FilterField as IFilterField } from '../types';
import { EMPTY_FIELD } from '../constants';

export interface ITableFilterList
  extends Omit<MUIDataTableFilter, 'filterList'>,
    Omit<MUIDataTableFilterList, 'filterList'> {
  columns: DataTableColumnState[];
  filterList: DataTableState['filterList'];
  filtersOpen: boolean;
  updateFilterByType: any;
}

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    root: {},
    innerRoot: {
      padding: spacing(1, 2),
      display: 'flex',
      marginTop: spacing(1),
      justifyContent: 'left',
      flexWrap: 'wrap',
    },
    collapse: {
      width: '100%',
    },
    filters: {
      flex: '1 1',
      position: 'relative',
    },
    filtersTop: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: spacing(1),
    },
    addNewFilter: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: spacing(3),
    },
    submit: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      width: 160,
      position: 'absolute',
      top: 0,
      right: 0,
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
    text: {
      color: palette.blue,
    },
  }),
  { name: 'MUIDataTableFilterList' },
);

const AddFilterButton: FC<{ limit: number }> = ({ limit }) => {
  const classes = useStyles();
  const {
    input: { onChange, value: fields },
  } = useField<IFilterField[]>('fields', { subscription: { value: true } });

  const disabled = useMemo(() => {
    if (fields.length === limit) {
      return true;
    }

    return fields.some(({ columnIndex }) => columnIndex === -1);
  }, [fields, limit]);

  const onAdd = useCallback(() => {
    onChange({
      target: {
        name: 'fields',
        value: [...fields, EMPTY_FIELD],
      },
    });
  }, [fields, onChange]);

  return (
    <Button color="primary" className={classes.addNewFilter} disabled={disabled} onClick={onAdd}>
      <AddIcon fontSize="small" className={classes.text} />
      <Typography variant="body2" className={classes.text}>
        <Trans>Add Filter</Trans>
      </Typography>
    </Button>
  );
};

const ResetFilterButton: FC<{ disabled: boolean }> = ({ disabled }) => {
  const {
    input: { onChange },
  } = useField<IFilterField[]>('fields', { subscription: { value: true } });
  const { submit } = useForm();

  const onReset = useCallback(() => {
    onChange({
      target: {
        name: 'fields',
        value: [EMPTY_FIELD],
      },
    });

    submit();
  }, [onChange, submit]);

  return (
    <Button variant="outlined" color="primary" onClick={onReset} disabled={disabled}>
      <Trans>Reset</Trans>
    </Button>
  );
};

export const TableFilterList: FC<ITableFilterList> = memo(({ options, filtersOpen, columns }) => {
  const classes = useStyles();

  const filters = useMemo<Filter[]>(() => {
    return compact(
      columns.map((column, index) => {
        const columnData = isString(column) ? { name: column } : column;

        if (!columnData.filter) {
          return null;
        }

        const filterType = columnData?.filterType || options.filterType;

        return {
          index,
          name: columnData.filterName || columnData.name,
          // internal type
          filterType,
          filterData: columnData.filterData ?? [], // options for checkboxes/radiobuttons/select
          filterOptions: columnData.filterOptions, // configuration option for the filter
          label: columnData.label || columnData.name,
        };
      }) || [],
    );
  }, [columns, options.filterType]);

  return (
    <Box className={classes.root}>
      <Collapse in={filtersOpen} timeout={300} className={classes.collapse}>
        <Box className={classes.innerRoot}>
          <Box className={classes.filters}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box className={classes.filtersTop}>
                <Typography variant="h6">
                  <Trans>Filters</Trans>
                </Typography>
                <AddFilterButton limit={filters.length} />
              </Box>
            </Box>
            <Box>
              <Field<IFilterField[]> name="fields" subscription={{ value: true }}>
                {({ input: { value: fields } }) => {
                  const selectedFilters = fields.map(({ columnIndex }) => columnIndex);

                  const availableFilters = filters.filter(
                    ({ index }) => !selectedFilters.includes(index),
                  );

                  return fields.map((field, index) => {
                    const filter = isNumber(field.columnIndex)
                      ? filters.find(({ index }) => index === field.columnIndex)
                      : undefined;

                    const column = columns.find(
                      ({ name, filterName }) => filter?.name === (filterName || name),
                    );

                    return (
                      <FilterField
                        key={index}
                        name={`fields[${index}]`}
                        availableFilters={availableFilters}
                        index={index}
                        filter={filter}
                        column={column}
                        options={options}
                      />
                    );
                  });
                }}
              </Field>
            </Box>
            <Box className={classes.submit}>
              <Field<IFilterField[]> name="fields" subscription={{ value: true }}>
                {({ input }) => (
                  <>
                    <ResetFilterButton
                      disabled={
                        isEmpty(input.value) ||
                        (input.value.length === 1 && input.value[0].columnIndex === -1)
                      }
                    />
                    <FormSpy subscription={{ dirty: true, dirtySinceLastSubmit: true }}>
                      {({ dirty, dirtySinceLastSubmit }) => (
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={
                            !(dirty || dirtySinceLastSubmit) || some(input.value, { value: null })
                          }
                          data-cy="Apply"
                        >
                          <Trans>Apply</Trans>
                        </Button>
                      )}
                    </FormSpy>
                  </>
                )}
              </Field>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
});

export default TableFilterList;
