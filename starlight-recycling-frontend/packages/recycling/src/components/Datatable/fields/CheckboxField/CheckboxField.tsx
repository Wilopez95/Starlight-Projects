import React, { FC } from 'react';
import { SelectOption } from '@starlightpro/common';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';

import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import { FilterDisplayOptions } from '../../../Filter/Filter';
import FilterInputAdd from '../../../Filter/FilterInputAdd';
import { useField } from 'react-final-form';

const useStyles = makeStyles(
  ({ spacing }) => ({
    option: {
      padding: 0,
    },
    checkBox: {
      padding: spacing(1, 2, 1, 2),
      marginRight: 0,
    },
  }),
  {
    name: 'FilterCheckbox',
  },
);

export interface FilterCheckboxProps extends FilterDisplayOptions {}
type filterOption = { value: string; label: JSX.Element | string };

export const CheckboxField: FC<FilterCheckboxProps> = ({ name, filterData }) => {
  const classes = useStyles();

  const {
    input: { value, onChange },
  } = useField(name);

  const selectedValues = value || [];

  // @ts-ignore
  const options = filterData as filterOption[];

  const handleChange = (option: filterOption) => {
    const result = selectedValues.includes(option.value)
      ? value.filter((v: string) => v !== option.value)
      : selectedValues.concat(option.value);
    onChange(result);
  };

  return (
    <FilterInputAdd hide={selectedValues.length >= options.length}>
      {({ ref, open, onClose }) =>
        (ref && (
          <Menu anchorEl={ref.current} keepMounted open={open} onClose={onClose}>
            {options.map((option) => (
              <SelectOption
                key={option.value}
                className={classes.option}
                data-cy={option.label}
                onKeyDown={(event) => {
                  if (['Space', 'Enter'].includes(event.nativeEvent.code)) {
                    handleChange(option);
                  }
                }}
              >
                <CheckBoxField
                  className={classes.checkBox}
                  label={option.label}
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleChange(option)}
                />
              </SelectOption>
            ))}
          </Menu>
        )) ||
        null
      }
    </FilterInputAdd>
  );
};

export default CheckboxField;
