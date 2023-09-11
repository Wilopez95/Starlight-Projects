import { Box, Divider } from '@material-ui/core';
import React, { FC } from 'react';
import { Trans } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import { NewSelectOption, CREATE_NEW_VALUE } from '../../NewSelectOption/NewSelectOption';
import { SearchField, SearchFieldProps, SelectOptions } from './SearchField';
import { createFilterOptions } from '@material-ui/lab/useAutocomplete';
import { SelectOption } from '@starlightpro/common';

const useStyles = makeStyles(
  (theme) => ({
    noOptions: {
      padding: 0,
    },
    newEntity: {
      height: 48,
      ...theme.typography.body2,
      cursor: 'pointer',
      position: 'relative',
    },
    input: {},
  }),
  { name: 'SearchFieldWithNewEntity' },
);

export interface SearchFieldWithNewEntityProps extends SearchFieldProps {
  name: string;
  options: SelectOptions;
  disabled?: boolean;
  label: React.ReactNode;
  required?: boolean;
  onChange?: (inputValue?: any) => void;
  onCreate?: () => void;
  newEntityName?: string;
  renderOption?(option: any): React.ReactNode;
  endAdornmentBefore?: React.ReactNode;
  classes?: SearchFieldProps['classes'] & {
    input?: string;
  };
}

const defaultFilterOptions = createFilterOptions();

export const SearchFieldWithNewEntity: FC<SearchFieldWithNewEntityProps> = ({
  name,
  options = [],
  label,
  disabled,
  newEntityName,
  onCreate,
  renderOption,
  endAdornmentBefore,
  onChange,
  classes: classesProp,
  required,
  ...restProps
}) => {
  const classes = useStyles({ classes: classesProp });
  const props = {
    ...restProps,
    noOptionsText:
      newEntityName && onCreate ? (
        <NewSelectOption newEntityName={newEntityName} />
      ) : (
        <SelectOption>
          <Trans>No options</Trans>
        </SelectOption>
      ),
  };

  return (
    <SearchField
      name={name}
      options={options}
      label={label}
      disabled={disabled}
      required={required}
      renderOption={(option) => {
        if (option === CREATE_NEW_VALUE && newEntityName && onCreate) {
          return (
            <Box className={classes.newEntity}>
              <Divider />
              <NewSelectOption newEntityName={newEntityName} />
            </Box>
          );
        }

        if (renderOption) {
          return renderOption(option);
        }

        return option.label;
      }}
      classes={{
        ...classesProp,
        noOptions: classes.noOptions,
        input: classes.input,
      }}
      onChange={(inputValue) => {
        if (inputValue === CREATE_NEW_VALUE) {
          onCreate && onCreate();
          onChange && onChange('');

          return;
        }

        onChange && onChange(inputValue);
      }}
      filterOptions={(options, state) => {
        const nextOptions = defaultFilterOptions(options, state);

        if (newEntityName && onCreate) {
          nextOptions.push(CREATE_NEW_VALUE);
        }

        return nextOptions;
      }}
      endAdornmentBefore={endAdornmentBefore}
      {...props}
    />
  );
};
