import React, { FC, useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash-es';
import { isEqual } from 'lodash/fp';
import { Trans } from '../../../i18n';
import { useField, Field } from 'react-final-form';
import { Autocomplete } from '@starlightpro/common';
import { makeStyles, Popper } from '@material-ui/core';
import TextField from '@starlightpro/common/components/TextField';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CloseIcon from '@material-ui/icons/Close';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete';
import { action, ColdSubscription } from 'popmotion';

export type SelectOptionType = { label: string; value: any; description?: string; id?: number };

export type SelectOptions = SelectOptionType[];

interface ValueMappers {
  mapFieldValueToFormValue: (value: SelectOptionType) => unknown;
  mapFormValueToFieldValue: (value: SelectOptionType) => unknown;
  mapInputValueToOption?: (value: unknown) => SelectOptionType | null;
}

// there's to much unknown here, it's lazy typing that should be rewritten in generics
export interface SearchFieldProps {
  name: string;
  options: SelectOptions;
  disabled?: boolean;
  required?: boolean;
  allowSearchQueryAsValue?: boolean; // wo number
  allowNonOptionValues?: boolean; // jobsite, customer etc
  label: React.ReactNode;
  InputComponent?: any;
  autoFocus?: boolean;
  onChange?: (value?: any) => void;
  onInputChange?: (inputValue: string) => void;
  classes?: {
    inputBaseRoot?: string;
    noOptions?: string;
    input?: string;
    labelRoot?: string;
  };
  blurOnSelect?: boolean;

  renderOption?(option: any): React.ReactNode;

  endAdornmentBefore?: React.ReactNode;
  dropDownFooter?: React.ReactNode;
  freeSolo?: boolean;
  filterOptions?: (options: unknown[], state: FilterOptionsState<unknown>) => unknown[];
  mapValues?: ValueMappers;
  id?: string;
}

const defaultMappers: ValueMappers = {
  mapFieldValueToFormValue: (option) => option?.value,
  mapFormValueToFieldValue: (value) => value,
  mapInputValueToOption: (value) => ({ value, label: value as string }),
};

const useStyles = makeStyles(
  ({ spacing, palette, typography }) => ({
    input: {
      padding: `${spacing(1, 1, 1, 1.5)}!important`,
    },
    addIcon: {
      color: palette.grey['600'],
      marginRight: spacing(1),
    },
    iconWrapper: {
      display: 'flex',
      maxHeight: '2em',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      marginRight: spacing(1),
      position: 'static',
    },
    icon: {
      width: '18px',
      height: '18px',
    },
    inputBaseRoot: {},
    labelRoot: {},
    noOptions: {},
    option: {
      height: 48,
      ...typography.body2,
      cursor: 'pointer',
      position: 'relative',
      padding: spacing(1, 2),
    },
  }),
  { name: 'SearchField' },
);

export const SearchField: FC<SearchFieldProps> = ({
  name,
  options = [],
  InputComponent = TextField,
  label,
  disabled,
  required,
  allowSearchQueryAsValue,
  allowNonOptionValues,
  classes: classesProp,
  onChange,
  onInputChange,
  renderOption,
  freeSolo,
  mapValues,
  ...props
}) => {
  const classes = useStyles({ classes: classesProp });
  const { input } = useField(name, { subscription: { value: true } });
  const [touched, setTouched] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<string | undefined>();
  const debouncedSetTouched = useMemo(() => {
    return debounce((nextTouched: boolean | undefined) => {
      if (nextTouched !== touched) {
        setTouched(nextTouched);
      }
    }, 200);
  }, [touched, setTouched]);
  const debouncedSetError = useMemo(() => {
    return debounce((nextError: string | undefined) => {
      if (nextError !== error) {
        setError(nextError);
      }
    }, 200);
  }, [setError, error]);

  const [optionValue, setOptionValue] = useState<any>(null);

  const {
    mapFieldValueToFormValue = defaultMappers.mapFieldValueToFormValue,
    mapFormValueToFieldValue = defaultMappers.mapFormValueToFieldValue,
    mapInputValueToOption = defaultMappers.mapInputValueToOption,
  } = (mapValues ?? {}) as ValueMappers;

  useEffect(() => {
    if (!options || options.length === 0) {
      return;
    }

    if (!input.value) {
      setOptionValue(
        allowSearchQueryAsValue
          ? {
              value: null,
              label: '',
            }
          : null,
      );

      return;
    }

    let nextOption =
      options.find((option) => option?.value === mapFormValueToFieldValue(input.value)) || null;

    if (allowNonOptionValues && input.value) {
      if (mapInputValueToOption) {
        setOptionValue(mapInputValueToOption(input.value));
      }

      return;
    }

    if ((allowSearchQueryAsValue && nextOption) || !allowSearchQueryAsValue) {
      setOptionValue(nextOption);
    }
  }, [
    options,
    input.value,
    mapFormValueToFieldValue,
    allowSearchQueryAsValue,
    onInputChange,
    allowNonOptionValues,
    mapInputValueToOption,
  ]);

  const { handleChange, handleInputChange } = useMemo(() => {
    let onChangeSub: ColdSubscription;
    let timeout: any = null;
    let changeActionUpdate: (value?: any) => void = () => {};
    const onChangeAction = action(({ update }) => {
      changeActionUpdate = update as any;
    });

    return {
      handleChange: (_event: any, value: any) => changeActionUpdate(value),
      handleInputChange: (_event: any, value: any) => {
        if (timeout) {
          onChangeSub.stop();
          clearTimeout(timeout);
          timeout = null;
        }

        const doChange = (value: any) => {
          clearTimeout(timeout);
          timeout = null;
          onChangeSub.stop();

          input.onChange({ target: { name, value, type: 'select' } });
        };

        onChangeSub = onChangeAction.start({
          update: (value: any) => {
            // here value is option
            const nextValue = mapFieldValueToFormValue(value);

            doChange(nextValue ?? value);

            if (onChange) {
              onChange(nextValue ?? value);

              if (!nextValue && !value) {
                onInputChange && onInputChange('');
              }
            }
          },
        });

        timeout = setTimeout(() => {
          if (!freeSolo) {
            // TODO: maybe call inputOnChange here
            onInputChange && onInputChange(value);

            if (allowSearchQueryAsValue) {
              setOptionValue({
                value,
                label: value,
              });
              onChange && onChange(value);
            }

            return;
          }

          let nextValue = value;
          let optionsContainsValue = false;

          if (mapInputValueToOption) {
            const option = mapInputValueToOption(value);

            if (option) {
              nextValue = mapFieldValueToFormValue(option);
              optionsContainsValue = true;
            } else {
              nextValue = value;
            }
          }

          if (!optionsContainsValue && allowSearchQueryAsValue) {
            setOptionValue({
              value: nextValue,
              label: nextValue,
            });
          }

          if (onInputChange) {
            onInputChange(nextValue);
          }

          if (nextValue !== options.find(({ value }) => value === input.value)?.label) {
            doChange(nextValue);
            onChange && onChange(nextValue);
          }
        }, 100);
      },
    };
  }, [
    freeSolo,
    input,
    mapFieldValueToFormValue,
    mapInputValueToOption,
    name,
    onChange,
    onInputChange,
    allowSearchQueryAsValue,
    options,
  ]);

  return (
    <>
      <Field
        name={name}
        subscription={{ touched: true, error: true, submitError: true, dirtySinceLastSubmit: true }}
      >
        {({ meta }) => {
          const { error, submitError, dirtySinceLastSubmit, touched } = meta;

          debouncedSetError(error || (!dirtySinceLastSubmit && submitError) || null);
          debouncedSetTouched(touched);
        }}
      </Field>
      <Autocomplete
        closeIcon={<CloseIcon className={classes.icon} />}
        popupIcon={<ArrowDropDownIcon className={classes.icon} />}
        classes={{
          input: classes.input,
          noOptions: classes.noOptions,
          option: classes.option,
          endAdornment: classes.iconWrapper,
        }}
        options={options}
        getOptionDisabled={(option: any) => option.disabled}
        getOptionLabel={(option: any) => (typeof option === 'string' ? option : option.label ?? '')}
        getOptionSelected={(option: any, value: any) => {
          return isEqual(option.value, value?.value || value);
        }}
        PopperComponent={(props: any) => <Popper {...props} data-cy={`${name} Popper`} />}
        renderOption={renderOption}
        value={optionValue}
        disabled={disabled}
        onClose={() => input.onBlur()}
        freeSolo={freeSolo}
        noOptionsText={<Trans>No options</Trans>}
        onChange={handleChange}
        onInputChange={handleInputChange}
        {...props}
        renderInput={(params: any) => (
          <InputComponent
            {...params}
            label={label}
            autoComplete="no"
            disabled={disabled}
            autoFocus={props.autoFocus}
            touched={touched}
            error={error}
            required={required}
            classes={{
              formControlInner: classes.inputBaseRoot,
              labelRoot: classesProp?.labelRoot ? classes.labelRoot : undefined,
            }}
          />
        )}
      />
    </>
  );
};
