import React, { memo, useEffect, useMemo, useState, useRef, ChangeEvent } from 'react';
import { useField } from 'react-final-form';
import { Autocomplete } from '@starlightpro/common';
import TextField from '@starlightpro/common/components/TextField';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import throttle from 'lodash/throttle';
import { forwardGeocode, getAdminDistrictsAtPoint, DistrictOption } from '../../mapbox';
import { useRegion } from '../../../hooks/useRegion';
import { TaxDistrictType } from '../../mapbox/types';

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

export interface AdminDistrictSearchFieldProps {
  name: string;
  label?: JSX.Element;
  fullWidth?: boolean;
  boundary?: TaxDistrictType;
  onChange?(option: DistrictOption | null): void;
}

export const AdminDistrictSearchField = memo<AdminDistrictSearchFieldProps>(
  ({ onChange, label, name, boundary }) => {
    const { input } = useField(name, { subscription: { value: true } });
    const classes = useStyles();
    const valueProp: DistrictOption = input.value;
    const inputRef = useRef<HTMLInputElement>();
    const inputEl = inputRef.current;
    const [value, setValue] = useState<DistrictOption | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<DistrictOption[]>([]);
    const { name: countryCode } = useRegion();

    const fetch = useMemo(
      () =>
        throttle(
          (searchRequest: { input: string }, callback: (results?: DistrictOption[]) => void) => {
            forwardGeocode(searchRequest.input, countryCode).then((addressOptions) => {
              if (!addressOptions || addressOptions.length === 0) {
                callback([]);

                return;
              }

              return getAdminDistrictsAtPoint(
                {
                  type: 'Point',
                  coordinates: addressOptions[0].center,
                },
                boundary && [boundary],
              ).then(callback);
            });
          },
          200,
        ),
      [boundary, countryCode],
    );

    useEffect(() => {
      if (!valueProp) {
        setValue(null);

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
    }, [value, valueProp, options, setValue]);

    useEffect(() => {
      if (!inputEl) {
        return;
      }

      inputEl.setAttribute('autocomplete', 'none');
    }, [inputEl]);

    useEffect(() => {
      let active = true;

      if (inputValue === '') {
        setOptions(value ? [value] : []);

        return undefined;
      }

      fetch({ input: inputValue }, (results?: DistrictOption[]) => {
        if (active) {
          let newOptions = [] as DistrictOption[];

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
        classes={{ input: classes.input, noOptions: classes.noOptions }}
        getOptionLabel={(option: any) =>
          typeof option === 'string' ? option : (option as DistrictOption).name
        }
        filterOptions={(x) => x}
        options={options}
        fullWidth
        includeInputInList
        filterSelectedOptions
        value={value}
        onChange={(event: ChangeEvent<{}>, value) => {
          const newValue = value as DistrictOption | null;
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
        onInputChange={(event: ChangeEvent<{}>, newInputValue) => {
          setInputValue(newInputValue as string);
        }}
        renderInput={(params: any) => (
          <TextField {...params} inputRef={inputRef} label={label} fullWidth autoComplete="none" />
        )}
        renderOption={(option: any) => {
          const matches = match(option.name, inputValue);
          const parts = parse(option.name, matches);

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
                  {(option as DistrictOption).fullName}
                </Typography>
              </Grid>
            </Grid>
          );
        }}
      />
    );
  },
);
