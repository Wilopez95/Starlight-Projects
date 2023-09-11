import React, { FC, ReactNode } from 'react';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash-es';
import { Field, Form } from 'react-final-form';
import cs from 'classnames';

import InputAdornment from '@material-ui/core/InputAdornment';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import SearchIcon from './SearchIcon';
import FilterIcon from '../icons/Filter';

const useStyles = makeStyles(({ spacing, palette, typography }) =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
    },
    searchRoot: {
      height: '100%',
      '&::before': {
        borderBottomColor: palette.grey[300],
        borderBottomWidth: 2,
      },
    },
    searchField: {
      margin: 0,
      height: '100%',
    },
    formControl: {
      height: '100%',
      ...typography.body2,
      '&[data-shrink=false] + $inputBaseRoot $inputBaseInput': {
        '&::-webkit-input-placeholder': 0.5,
        '&::-moz-placeholder': 0.5, // Firefox 19+
        '&:-ms-input-placeholder': 0.5, // IE 11
        '&::-ms-input-placeholder': 0.5, // Edge
      },
    },
    inputBaseInput: {
      fontSize: '14px',
      lineHeight: '20px',
      padding: spacing(1, 1.5, 1, 0),
      minHeight: '36px',
      boxSizing: 'border-box',
    },
    divider: {
      margin: spacing(0, 1),
    },
    searchLabel: {
      marginLeft: spacing(1),
    },
    endAdornment: {
      cursor: 'pointer',
    },
    filterToggle: {
      width: 16,
      height: 17,
      '& path': {
        stroke: palette.primary.main,
      },
    },
    dropDownIcon: {
      transition: 'transform 0.3s',
      fill: palette.grey[500],
    },
    rotate: {
      transform: 'rotate(-180deg)',
    },
  }),
);
const initialValues = {
  search: '',
};

export interface SearchOption {
  value: string;
  label: string | ReactNode;
  description: string;
}

export interface SearchProps {
  filterState?: boolean;
  placeholder?: string;
  showEndAdornment?: boolean;
  onChange: (value: string) => void;
  onClickEndAdornment?(e: React.MouseEvent<HTMLElement>): void;
}

export const Search: FC<SearchProps> = ({
  onChange,
  placeholder,
  onClickEndAdornment,
  filterState,
  showEndAdornment,
}) => {
  const classes = useStyles();

  const debouncedChange = debounce((value: string) => onChange(value), 600);

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => onChange(values.search)}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className={classes.root}>
          <Field name="search" type="text">
            {({ input }) => (
              <TextField
                {...input}
                autoComplete="off"
                fullWidth
                id="search-input"
                placeholder={placeholder}
                className={classes.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  classes: {
                    root: classes.searchRoot,
                    input: classes.inputBaseInput,
                  },
                  endAdornment: showEndAdornment && (
                    <InputAdornment
                      position="start"
                      className={classes.endAdornment}
                      onClick={onClickEndAdornment}
                    >
                      <FilterIcon className={classes.filterToggle} />
                      <ArrowDropDownIcon
                        className={cs(classes.dropDownIcon, { [classes.rotate]: filterState })}
                      />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  debouncedChange(e.target.value);
                  input.onChange(e);
                }}
              />
            )}
          </Field>
        </form>
      )}
    />
  );
};

export default Search;
