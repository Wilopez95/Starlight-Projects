import React, { FC } from 'react';
import { SelectOption } from '@starlightpro/common';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import FilterInputAdd from '../../FilterInputAdd';
import { FilterInputProps } from '../../Filter';
import { DataTableState } from '../../../Datatable/types';

const useStyles = makeStyles(
  ({ palette, spacing }) => ({
    chip: {
      display: 'inline-flex',
      margin: spacing(0, 1),
      backgroundColor: palette.grey[100],
      borderRadius: '17.5px',
    },
    option: {
      padding: 0,
    },
    checkBox: {
      padding: spacing(1, 2, 1, 2),
      marginRight: 0,
    },
    chips: {},
    hidden: {
      display: 'none',
    },
  }),
  {
    name: 'FilterMenuValue',
  },
);

export interface FilterValueProps extends FilterInputProps {
  filterList: DataTableState['filterList'];
  onChange: (val: string[]) => void;
  index: number;
}

export const FilterMenuValueField: FC<FilterValueProps> = ({
  filterList,
  index,
  filterData,
  onChange,
}) => {
  const classes = useStyles();
  const menuOptions = filterData || [];
  const selectedValues = filterList[index] || [];

  return (
    <Box>
      <FilterInputAdd hide={selectedValues.length >= menuOptions.length}>
        {({ ref, open, onClose }) => (
          <Menu
            anchorEl={ref.current}
            keepMounted
            open={open && selectedValues.length < menuOptions.length}
            onClose={onClose}
          >
            {(menuOptions || []).map((option) => (
              <SelectOption className={classes.option}>
                <CheckBoxField
                  className={classes.checkBox}
                  label={option.label}
                  checked={selectedValues.includes(option.value)}
                  onChange={() => {
                    let newSelected;

                    if (selectedValues.includes(option.value)) {
                      newSelected = selectedValues.filter((v) => v !== option.value);
                    } else {
                      newSelected = [...selectedValues, option.value];
                    }

                    onChange(newSelected);
                  }}
                />
              </SelectOption>
            ))}
          </Menu>
        )}
      </FilterInputAdd>
    </Box>
  );
};
