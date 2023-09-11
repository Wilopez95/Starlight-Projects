import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Box from '@material-ui/core/Box';
import FilterInputAdd from '../../../Filter/FilterInputAdd';
import { FilterInputProps } from '../../../Filter/Filter';
import { Autocomplete, AutocompleteProps, FilterSearchValueType } from './Autocomplete';
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

export const SearchValueField: FC<FilterSearchValueProps> = ({
  name,
  filterData,
  multiselect,
  SearchComponent,
}) => {
  const classes = useStyles();
  const {
    input: { value: formControlValue, onChange },
  } = useField(name);
  const value = multiselect ? formControlValue : formControlValue[0];
  const AutocompleteComp = SearchComponent || Autocomplete;

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
                  // todo (yakovenko): check it important
                  filterData={filterData as any}
                  // inputClassName={classes.input}
                  onChange={(value: FilterSearchValueType[]) => {
                    if (value) {
                      if (multiselect) {
                        onChange(value);
                      } else {
                        onChange([value]);
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
