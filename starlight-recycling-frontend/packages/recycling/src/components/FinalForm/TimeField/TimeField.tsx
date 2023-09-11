import React, { memo, ReactElement, useMemo, useState, useCallback } from 'react';
import { debounce } from 'lodash-es';
import cs from 'classnames';
import { Moment } from 'moment';
import { useField, Field } from 'react-final-form';
import { KeyboardTimePicker, KeyboardTimePickerProps } from '@material-ui/pickers';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { makeStyles } from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@starlightpro/common/components/TextField';

export interface TimeFieldProps extends Omit<KeyboardTimePickerProps, 'onChange' | 'value'> {
  name: string;
  label?: string | ReactElement;
  required?: boolean;
  fullWidth?: boolean;
  classes?: TextFieldProps['classes'];
  onChange?: (date: Moment | Date | null) => void;
}

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    inputBaseInput: {
      paddingRight: 0,
    },
    keyboardButtonLabel: {
      '& > svg': {
        width: spacing(2),
        height: spacing(2),
      },
    },
    inputAdornmentPositionEnd: {
      margin: 0,
    },
    buttonRoot: {
      padding: spacing(1),
      color: palette.grey[500],
    },
  }),
  { name: 'TimeField' },
);

const InnerTextField = memo<TextFieldProps>((props) => {
  const { name } = props;
  const { input } = useField(name as string, { subscription: {} });
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

  return (
    <>
      <Field
        name={name as string}
        subscription={{ touched: true, error: true, submitError: true, dirtySinceLastSubmit: true }}
      >
        {({ meta }) => {
          const { error, submitError, dirtySinceLastSubmit, touched } = meta;

          debouncedSetError(error || (!dirtySinceLastSubmit && submitError) || null);
          debouncedSetTouched(touched);
        }}
      </Field>
      <TextField
        {...props}
        touched={touched || !!props.error}
        error={error || props.error}
        onBlur={input.onBlur}
        onFocus={input.onFocus}
      />
    </>
  );
});

export const TimeField = memo<TimeFieldProps>(
  ({ name, onChange, classes: classesProp, ...props }) => {
    const classes = useStyles();
    const { input } = useField(name, { subscription: { value: true } });
    const onInputChange = input.onChange;
    const onInputBlur = input.onBlur;
    const handleDateChange = useMemo(() => {
      return (date: Moment | Date | null) => {
        if (onChange) {
          onChange(date);
        }

        onInputChange({
          target: {
            name,
            value: date,
          },
        });
      };
    }, [onChange, onInputChange, name]);

    const value = useMemo(() => {
      return !!input.value ? new Date(input.value) : null;
    }, [input.value]);

    const TextFieldMemo = useCallback(
      (props) => {
        return (
          <InnerTextField
            {...props}
            name={name}
            classes={{
              ...classesProp,
              ...props.InputProps?.classes,
              inputBaseInput: cs(classes.inputBaseInput, classesProp?.inputBaseInput),
            }}
          />
        );
      },
      [classes.inputBaseInput, classesProp, name],
    );

    return (
      <KeyboardTimePicker
        {...props}
        autoOk
        value={value}
        keyboardIcon={<ScheduleIcon />}
        variant="inline"
        TextFieldComponent={TextFieldMemo}
        InputAdornmentProps={{
          classes: {
            positionEnd: classes.inputAdornmentPositionEnd,
          },
        }}
        onClose={onInputBlur}
        KeyboardButtonProps={{
          classes: {
            root: classes.buttonRoot,
            label: classes.keyboardButtonLabel,
          },
        }}
        onChange={handleDateChange}
        {...props}
      />
    );
  },
);
