import React, { FC } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@starlightpro/common';
import { InputAdornment } from '@material-ui/core';
import { Field } from 'react-final-form';

const useStyles = makeStyles(
  ({ palette, spacing }) => ({
    main: {
      display: 'flex',
      flex: '1 0 auto',
    },
    searchIcon: {
      color: palette.text.secondary,
    },
    searchText: {
      marginBottom: 0,
    },
    clearIcon: {
      '&:hover': {
        color: palette.error.main,
      },
    },
    inputRoot: {
      paddingBottom: 12,
      paddingTop: 6,

      '&:before': {
        borderBottomWidth: 2,
        borderBottomColor: palette.grey[300],
      },
    },
    inputBaseRoot: {
      boxShadow: 'none',
      background: 'transparent',
      paddingBottom: spacing(1),

      '&:before, &:after': {
        borderRadius: 0,
        borderTopWidth: '0 !important',
        borderRightWidth: '0 !important',
        borderLeftWidth: '0 !important',
        borderBottomWidth: '2px !important',
      },
    },
    input: {
      fontSize: 14,
      paddingTop: 8,
    },
  }),
  { name: 'TableSearch' },
);

export interface Props {
  searchText?: string;
  onHide?: () => void;
  onSearch?: (value: string) => Promise<void>;
  options?: {
    textLabels?: {
      toolbar?: {
        search?: string;
      };
    };
    searchPlaceholder?: string;
  };
  endAdornment?: JSX.Element;
}

const TableSearch: FC<Props> = ({ options, endAdornment }) => {
  const classes = useStyles();

  return (
    <div className={classes.main}>
      <TextField
        autoComplete="off"
        fullWidth
        id="search-input"
        name="searchText"
        className={classes.searchText}
        autoFocus={true}
        classes={{
          inputBaseRoot: classes.inputBaseRoot,
        }}
        InputProps={{
          classes: {
            root: classes.inputRoot,
            input: classes.input,
          },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className={classes.searchIcon} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Field name="searchText" subscription={{ value: true }}>
                {({ input }) =>
                  !!input.value && (
                    <IconButton
                      className={classes.clearIcon}
                      onClick={() => input.onChange({ target: { name: 'searchText', value: '' } })}
                    >
                      <ClearIcon />
                    </IconButton>
                  )
                }
              </Field>
              {endAdornment}
            </InputAdornment>
          ),
        }}
        inputProps={{
          'aria-label': options?.textLabels?.toolbar?.search,
        }}
        // value={value}
        // onKeyDown={onKeyDown}
        // onChange={handleTextChange}
        placeholder={options?.searchPlaceholder}
        // {...(options?.searchProps ? options.searchProps : {})}
      />
    </div>
  );
};

export default TableSearch;
