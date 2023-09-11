import React, { ReactElement, memo, useState, useMemo } from 'react';
import { Trans } from '../../../i18n';
import { merge, debounce } from 'lodash-es';
import cs from 'classnames';
import { useField, Field } from 'react-final-form';
import Box from '@material-ui/core/Box';
import TextField, {
  OutlinedTextFieldProps as IOutlinedTextFieldProps,
} from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      root: {
        '& .MuiFormHelperText-root.MuiFormHelperText-contained.Mui-error': {
          position: 'absolute',
          bottom: -theme.spacing(3),
        },
      },
      labelStart: {
        marginLeft: 0,
        marginRight: 0,
        marginBottom: theme.spacing(4),
      },
      labelStartLabel: {
        paddingRight: theme.spacing(2),
      },
      labelTextField: {
        marginBottom: 0,
      },
      textFieldRoot: {
        marginTop: theme.spacing(1),
      },
    }),
  {
    name: 'OutlinedTextField',
  },
);

export interface OutlinedTextFieldProps extends Partial<IOutlinedTextFieldProps> {
  id?: string;
  name: string;
  label?: string | ReactElement;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'number' | 'password' | 'email' | 'tel';
  min?: number;
  max?: number;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  className?: string;
  inputClassName?: string;
  classes?: any;
  fullWidth?: boolean;
  step?: string;
  readOnly?: boolean;
}

export const OutlinedTextField = memo<OutlinedTextFieldProps>((props) => {
  const { name, type, labelPlacement, readOnly } = props;
  const classes = useStyles();
  const { input } = useField(name, { type: type || 'text', subscription: { value: true } });
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
  const debouncedMeta = (
    <Field name={name} subscription={{ touched: true, error: true, submitError: true }}>
      {({ meta }) => {
        debouncedSetError(meta.error || meta.submitError);
        debouncedSetTouched(meta.touched);
      }}
    </Field>
  );

  if (labelPlacement) {
    let labelClassName = '';
    let labelTextFieldClassName = '';
    let labelStartLabelClassName = '';

    switch (labelPlacement) {
      case 'start': {
        labelClassName = classes.labelStart;
        labelTextFieldClassName = classes.labelTextField;
        labelStartLabelClassName = classes.labelStartLabel;
      }
    }

    return (
      <Box>
        {debouncedMeta}
        <FormControlLabel
          classes={{
            ...props.classes,
            root: cs(classes.root, props.classes?.root),
            label: cs(labelStartLabelClassName, props.classes?.label),
          }}
          className={cs(labelClassName, props.className)}
          label={
            <React.Fragment>
              {props.label}
              {props.required && '\u00a0*'}
            </React.Fragment>
          }
          labelPlacement={props.labelPlacement}
          control={
            <TextField
              {...input}
              fullWidth={props.fullWidth}
              rows={props.rows}
              variant="outlined"
              className={cs(labelTextFieldClassName, props.inputClassName)}
              multiline={props.multiline}
              error={touched && !!error}
              helperText={touched && error && <Trans>{error}</Trans>}
              inputProps={{ readOnly: readOnly }}
            />
          }
        />
      </Box>
    );
  }

  return (
    <>
      {debouncedMeta}
      <TextField
        {...input}
        {...props}
        aria-valuemin={props.min}
        aria-valuemax={props.max}
        variant="outlined"
        error={touched && !!error}
        helperText={touched && error && <Trans>{error}</Trans>}
        classes={merge(
          {
            root: cs(classes.textFieldRoot, classes.root),
          },
          props.classes,
        )}
        InputProps={{
          inputProps: {
            min: props.min,
            max: props.max,
            step: props.step,
            readOnly: readOnly,
          },
          ...props.InputProps,
        }}
      />
    </>
  );
});

export default OutlinedTextField;
