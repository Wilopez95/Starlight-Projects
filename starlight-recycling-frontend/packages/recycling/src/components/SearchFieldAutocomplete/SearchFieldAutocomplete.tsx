import React, { FC } from 'react';
import { Autocomplete } from '@starlightpro/common';
import { isEqual, isArray } from 'lodash/fp';
import { Trans } from '../../i18n';
import TextField from '@starlightpro/common/components/TextField';

import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { isObject } from 'lodash-es';
import { AutocompleteProps } from '@starlightpro/common/components/Autocomplete';

const useStyles = makeStyles(({ typography, spacing }) => ({
  icon: {
    width: '18px',
    height: '18px',
  },
  noOptions: {},
  option: {
    height: 48,
    ...typography.body2,
    cursor: 'pointer',
    position: 'relative',
    padding: '10px 20px 10px 16px',
  },
  iconWrapper: {
    marginRight: spacing(1),
  },
  inputBaseRoot: {},
}));

export interface SearchFieldAutocompleteProps {
  value?: unknown;
  disabled?: boolean;
  label?: string | React.ReactNode;
  options: Array<{ label: string; value: any }>;
  classes?: {
    inputBaseRoot?: string;
    noOptions?: string;
  };

  onChange?(value?: any): void;

  fullWidth?: boolean;
  className?: string;
  multiple?: boolean;
  renderTags?: () => React.ReactNode;
  loading?: boolean;
  inputValue?: string;

  onInputChange?(
    event: React.ChangeEvent<{}>,
    value: string,
    reason: 'input' | 'reset' | 'clear',
  ): void;

  freeSolo?: boolean;

  filterOptions?(options: unknown[], state: any): unknown[];

  renderOption?(option: any): React.ReactNode;

  renderInput?(params: any): React.ReactNode;

  disableClearable?: boolean;
  getMenuItemProps?: AutocompleteProps<any>['getMenuItemProps'];
}

export const SearchFieldAutocomplete: FC<SearchFieldAutocompleteProps> = ({
  disabled,
  options,
  onChange,
  label,
  classes: classesProp,
  fullWidth,
  value,
  ...props
}) => {
  const classes = useStyles({ classes: classesProp });

  return (
    <Autocomplete
      closeIcon={<CloseIcon className={classes.icon} />}
      popupIcon={<ArrowDropDownIcon className={classes.icon} />}
      classes={{
        noOptions: classes.noOptions,
        option: classes.option,
        endAdornment: classes.iconWrapper,
      }}
      options={options.filter(({ value: optionValue }) =>
        ((value as any[]) || []).every(({ value: selectedValue }) => selectedValue !== optionValue),
      )}
      open
      getOptionDisabled={(option: any) => option.disabled}
      getOptionLabel={(option: any) => {
        if (isArray(option)) {
          return '';
        }

        if (isObject(option)) {
          return (option as any).label || '';
        }

        return option || '';
      }}
      getOptionSelected={(option: any, value: any) => {
        if (isArray(value)) {
          return value.includes(option.value);
        }

        return isEqual(option.value, value?.value || value);
      }}
      value={value}
      disabled={disabled}
      noOptionsText={<Trans>No options</Trans>}
      {...props}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={label}
          autoComplete="no"
          disabled={disabled}
          classes={{ root: classes.inputBaseRoot }}
          fullWidth={fullWidth}
        />
      )}
      onChange={(event, newValue?: any) => {
        if (onChange) {
          onChange(newValue);
        }
      }}
    />
  );
};

export default SearchFieldAutocomplete;
