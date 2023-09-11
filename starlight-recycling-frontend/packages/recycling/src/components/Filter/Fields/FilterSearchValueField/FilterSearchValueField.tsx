import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Box from '@material-ui/core/Box';
import FilterInputAdd from '../../FilterInputAdd';
import { FilterInputProps } from '../../Filter';
import { Authocomplete, AutocompleteProps, FilterSearchValueType } from './Autocomplete';
import { useField } from 'react-final-form';

const useStyles = makeStyles(
  () => ({
    root: {},
    search: {
      display: 'inline-flex',
      width: 260,
    },
    input: {
      margin: 0,
    },
  }),
  { name: 'FilterSearchValue' },
);

export interface FilterSearchValueProps extends FilterInputProps {
  multiselect?: boolean;
  SearchComponent?: React.ComponentType<AutocompleteProps>;
}

export const FilterSearchValueField: FC<FilterSearchValueProps> = ({
  name,
  filterData,
  multiselect,
  SearchComponent,
}) => {
  const classes = useStyles();
  const {
    input: { value, onChange },
  } = useField(name);

  const AutocompleteComp = SearchComponent || Authocomplete;

  // @ts-ignore
  return (
    <Box className={classes.root}>
      <FilterInputAdd>
        {({ onClose, open }) =>
          (open && (
            <ClickAwayListener
              onClickAway={() => {
                onClose();
              }}
            >
              <Box display="inline-flex">
                <AutocompleteComp
                  multiple={multiselect}
                  value={value}
                  className={classes.search}
                  // @ts-ignore
                  filterData={filterData}
                  onChange={(newValue: FilterSearchValueType | FilterSearchValueType[]) => {
                    if (newValue) {
                      if (multiselect) {
                        onChange(newValue);
                      } else {
                        const selectedValues = (value || []) as FilterSearchValueType[];
                        const currentValue = newValue as FilterSearchValueType;
                        const result = selectedValues.includes(currentValue.value as any)
                          ? selectedValues.filter(({ value: v }) => v !== currentValue.value)
                          : selectedValues.concat(currentValue);
                        onChange(result);
                      }

                      onClose();
                    }
                  }}
                />
              </Box>
            </ClickAwayListener>
          )) ||
          null
        }
      </FilterInputAdd>
    </Box>
  );
};

export default FilterSearchValueField;
