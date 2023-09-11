import React, { memo, ReactElement, useMemo, useState, useCallback } from 'react';
import { isString, debounce } from 'lodash-es';
import { Moment } from 'moment';
import { useField, Field } from 'react-final-form';
import TextField, { TextFieldProps } from '@starlightpro/common/components/TextField';
import { KeyboardDatePicker, useUtils, KeyboardDatePickerProps } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { makeStyles } from '@material-ui/core/styles';

export interface DateFieldProps
  extends Omit<KeyboardDatePickerProps, 'TextFieldComponent' | 'value' | 'onChange'> {
  name: string;
  label?: string | ReactElement;
  required?: boolean;
  fullWidth?: boolean;
  minDate?: Date | string | 'now';
  TextFieldComponent?:
    | React.ComponentClass<TextFieldProps, any>
    | React.FunctionComponent<TextFieldProps>
    | undefined;
  onChange?: KeyboardDatePickerProps['onChange'];
}

const useStyles = makeStyles(
  ({ spacing }) => ({
    keyboardButtonLabel: {
      '& > svg': {
        width: spacing(2),
        height: spacing(2),
      },
    },
  }),
  { name: 'DateField' },
);

const dateFormat = 'MM/DD/YYYY';

interface TextFieldWrapperOptions extends TextFieldProps {
  TextFieldComponent?:
    | React.ComponentClass<TextFieldProps, any>
    | React.FunctionComponent<TextFieldProps>
    | undefined;
  name: string;
  required?: boolean;
  fullWidth?: boolean;
  forceShowError?: boolean;
}

const TextFieldInnerWrapper = ({
  TextFieldComponent = TextField,
  name,
  forceShowError,
  fullWidth,
  ...props
}: TextFieldWrapperOptions) => {
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
      <Field name={name} subscription={{ touched: true, error: true }}>
        {({ meta }) => {
          debouncedSetError(meta.error);
          debouncedSetTouched(meta.touched);
        }}
      </Field>
      <TextFieldComponent
        {...props}
        fullWidth={fullWidth}
        touched={touched || forceShowError}
        error={error || props.error}
      />
    </>
  );
};

export const DateField = memo<DateFieldProps>(
  ({
    minDate,
    name,
    label,
    required,
    fullWidth,
    TextFieldComponent,
    onChange: onChangeProp,
    ...props
  }) => {
    const classes = useStyles();
    const { input } = useField(name, { subscription: { value: true } });
    const utils = useUtils();

    const onChange = input.onChange;

    const handleDateChange = useMemo(() => {
      return (date: MaterialUiPickersDate, value?: string | null | undefined) => {
        if (onChangeProp) {
          onChangeProp(date, value);
        }

        onChange({
          target: {
            name,
            value: date,
          },
        });
      };
    }, [onChangeProp, onChange, name]);

    const minDateRestriction: Moment | Date | null | undefined = useMemo(() => {
      if (isString(minDate)) {
        try {
          if (minDate === 'now') {
            return new Date();
          }

          return utils.parse(minDate, dateFormat) || undefined;
        } catch {
          return null;
        }
      }

      return minDate || undefined;
    }, [minDate, utils]);

    const TextFieldMemo = useCallback(
      (props) => {
        return (
          <TextFieldInnerWrapper
            {...props}
            classes={props.InputProps?.classes}
            name={name}
            TextFieldComponent={TextFieldComponent}
            fullWidth={fullWidth}
            forceShowError={!!minDate && minDate !== 'now'}
          />
        );
      },
      [TextFieldComponent, fullWidth, minDate, name],
    );

    return (
      <KeyboardDatePicker
        {...props}
        autoOk
        label={label}
        value={!!input.value ? input.value : null}
        format={dateFormat}
        variant="inline"
        required={required}
        minDate={minDateRestriction}
        minDateMessage={null}
        InputAdornmentProps={{ position: 'end', ...props.InputAdornmentProps }}
        KeyboardButtonProps={{
          classes: {
            label: classes.keyboardButtonLabel,
            ...props.KeyboardButtonProps?.classes,
          },
          'aria-label': 'date',
          ...props.KeyboardButtonProps,
        }}
        leftArrowButtonProps={{
          'aria-label': 'previous month',
        }}
        rightArrowButtonProps={{
          'aria-label': 'next month',
        }}
        onChange={handleDateChange}
        TextFieldComponent={TextFieldMemo}
      />
    );
  },
);
