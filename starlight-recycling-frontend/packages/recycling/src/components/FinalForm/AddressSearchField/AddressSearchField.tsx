import React, { memo, useEffect, useMemo, useState, useRef } from 'react';
import { isEmpty, debounce, isString } from 'lodash-es';
import { useField } from 'react-final-form';
import TextField from '@starlightpro/common/components/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { forwardGeocode, AddressOption } from '../../mapbox';
import { useRegion } from '../../../hooks/useRegion';

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  input: {
    padding: theme.spacing(1, 5.9, 1, 1.5) + '!important',
  },
  noOptions: {},
}));

export interface AddressSearchFieldProps {
  name: string;
  label?: JSX.Element;
  fullWidth?: boolean;
  onChange?(option: AddressOption | null): void;
}

export const AddressSearchField = memo<AddressSearchFieldProps>(({ onChange, label, name }) => {
  const { input } = useField(name, { subscription: { value: true } });
  const classes = useStyles();
  const valueProp: AddressOption = input.value;
  const inputRef = useRef<HTMLInputElement>();
  const inputEl = inputRef.current;
  const [value, setValue] = useState<AddressOption | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AddressOption[]>([valueProp]);
  const { name: countryCode } = useRegion();

  const fetch = useMemo(
    () =>
      debounce(
        (searchRequest: { input: string }, callback: (results?: AddressOption[]) => void) => {
          forwardGeocode(searchRequest.input, countryCode).then((addressOptions) =>
            callback(addressOptions || []),
          );
        },
        200,
      ),
    [countryCode],
  );

  useEffect(() => {
    if (!valueProp) {
      return;
    }

    if (valueProp !== value) {
      setValue(valueProp || null);

      const option = options.find(({ id }) => valueProp.id === id);

      if (!option) {
        // fix warning in autocomplete
        options.push(valueProp);
      }
    }
  }, [options, value, valueProp]);

  useEffect(() => {
    if (!inputEl) {
      return;
    }

    inputEl.setAttribute('autocomplete', 'none');
  }, [inputEl]);

  useEffect(() => {
    let active = true;

    if (isEmpty(inputValue)) {
      setOptions(value ? [value] : []);

      return undefined;
    }

    fetch({ input: inputValue }, (results?: AddressOption[]) => {
      if (active) {
        let newOptions = [] as AddressOption[];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      getOptionLabel={(option) => (isString(option) ? option : option.text)}
      classes={{ input: classes.input, noOptions: classes.noOptions }}
      filterOptions={(x) => x}
      options={options}
      fullWidth
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event: any, newValue: AddressOption | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);

        input.onChange({
          target: {
            name,
            value: newValue,
          },
        });

        if (onChange) {
          onChange(newValue);
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} inputRef={inputRef} label={label} fullWidth autoComplete="none" />
      )}
      renderOption={(option) => {
        const matches = match(option.text, inputValue);
        const parts = parse(option.text, matches);

        return (
          <Grid container alignItems="center">
            <Grid item>
              <LocationOnIcon className={classes.icon} />
            </Grid>
            <Grid item xs>
              {parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                  {part.text}
                </span>
              ))}
              <Typography variant="body2" color="textSecondary">
                {option.text}
              </Typography>
            </Grid>
          </Grid>
        );
      }}
    />
  );
});
