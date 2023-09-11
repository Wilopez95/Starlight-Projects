import React, { FC, useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import TextField from '@starlightpro/common/components/TextField';
import { FilterInputProps } from '../../Filter';
import FilterInputAdd from '../../FilterInputAdd';
import { useField } from 'react-final-form';

const useStyles = makeStyles(() => ({
  root: {},
  field: {
    display: 'inline-flex',
    width: 260,
  },
  input: {
    margin: 0,
  },
}));

export interface FilterTextValueProps extends FilterInputProps {}

export const FilterTextValueField: FC<FilterTextValueProps> = ({ name }) => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const {
    input: { value, onChange },
  } = useField(name);

  const handleChange = useCallback(
    (newValue: string) => {
      if (value && value.some((option: { value: string }) => option.value === newValue)) {
        return;
      }

      onChange([...value, { label: newValue, value: newValue }]);
    },
    [onChange, value],
  );

  return (
    <ClickAwayListener
      onClickAway={() => {
        setOpen(false);
      }}
    >
      <Box className={classes.root}>
        <FilterInputAdd hide={isOpen} onClick={() => setOpen(true)}>
          {({ onClose, open }) =>
            open ? (
              <TextField
                autoFocus
                fullWidth
                className={classes.field}
                classes={{ inputBaseInput: classes.input }}
                onBlur={(e) => {
                  if (e.target.value) {
                    handleChange(e.target.value);
                  }
                  onClose();
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.code === 'Enter') {
                    e.preventDefault();

                    if ((e.nativeEvent.target as HTMLInputElement).value) {
                      handleChange((e.nativeEvent.target as HTMLInputElement).value);
                    }
                    onClose();
                    setOpen(false);
                  }
                }}
              />
            ) : null
          }
        </FilterInputAdd>
      </Box>
    </ClickAwayListener>
  );
};

export default FilterTextValueField;
