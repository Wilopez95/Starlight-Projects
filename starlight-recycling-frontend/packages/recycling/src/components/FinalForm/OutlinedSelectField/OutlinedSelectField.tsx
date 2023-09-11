import React, { ReactElement, memo, useState, useMemo, ReactNode } from 'react';
import { merge, debounce } from 'lodash-es';
import { useField, Field } from 'react-final-form';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Trans } from '../../../i18n';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      root: {
        marginTop: theme.spacing(1),
        '& .MuiFormHelperText-root': {
          position: 'absolute',
          bottom: -theme.spacing(3),
        },
      },
    }),
  {
    name: 'SelectField',
  },
);

interface SelectFieldProps {
  name: string;
  id?: string;
  label?: string | ReactElement;
  separateLabel?: boolean;
  className?: string;
  inputClassName?: string;
  classes?: any;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const OutlinedSelectField = memo<SelectFieldProps>(
  ({
    id,
    name,
    label,
    separateLabel,
    className,
    inputClassName,
    classes: overrideClasses,
    children,
    required,
    disabled,
    fullWidth,
  }) => {
    const { input, meta } = useField(name, { subscription: { value: true } });
    const classes = useStyles();
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
    const labelId = `select-field-label-${name}`;
    const labelComp = (
      <React.Fragment>
        {label}
        {required && '\u00a0*'}
      </React.Fragment>
    );
    const debouncedMeta = (
      <Field name={name} subscription={{ touched: true, error: true, submitError: true }}>
        {({ meta }) => {
          debouncedSetError(meta.error || meta.submitError);
          debouncedSetTouched(meta.touched);
        }}
      </Field>
    );
    const { selectRoot, ...formControlClasses } = overrideClasses || {};

    if (separateLabel) {
      return (
        <>
          {debouncedMeta}
          <FormControlLabel
            labelPlacement="start"
            className={className}
            label={labelComp}
            classes={merge(
              {
                root: classes.root,
              },
              formControlClasses,
            )}
            disabled={disabled}
            control={
              <Select
                {...input}
                disabled={disabled}
                variant="outlined"
                className={inputClassName}
                classes={{
                  root: overrideClasses?.selectRoot,
                }}
                error={meta.touched && !!meta.error}
              >
                {children}
              </Select>
            }
          />
        </>
      );
    }

    return (
      <>
        {debouncedMeta}
        <FormControl
          variant="outlined"
          fullWidth={fullWidth}
          className={className}
          error={touched && !!error}
          disabled={disabled}
          classes={merge(
            {
              root: classes.root,
            },
            formControlClasses,
          )}
        >
          <InputLabel id={labelId} disabled={disabled}>
            {labelComp}
          </InputLabel>
          <Select
            className={inputClassName}
            classes={{
              root: selectRoot,
            }}
            disabled={disabled}
            id={id}
            labelId={labelId}
            {...input}
            label={labelComp}
            error={touched && !!error}
          >
            {children}
          </Select>
          <FormHelperText>{touched && error && <Trans>{error}</Trans>}</FormHelperText>
        </FormControl>
      </>
    );
  },
);

export default OutlinedSelectField;
