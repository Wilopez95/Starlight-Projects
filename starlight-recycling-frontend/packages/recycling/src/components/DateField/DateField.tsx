import React, { memo, ReactElement, useMemo, useCallback } from 'react';
import { isString } from 'lodash-es';
import { Moment } from 'moment';
import TextField, { TextFieldProps } from '@starlightpro/common/components/TextField';
import { KeyboardDatePicker, useUtils, KeyboardDatePickerProps } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';

export interface DateFieldProps extends Omit<KeyboardDatePickerProps, 'TextFieldComponent'> {
  label?: string | ReactElement;
  required?: boolean;
  fullWidth?: boolean;
  minDate?: Date | string | 'now';
  TextFieldComponent?:
    | React.ComponentClass<TextFieldProps, any>
    | React.FunctionComponent<TextFieldProps>
    | undefined;
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
  ...props
}: TextFieldWrapperOptions) => {
  return <TextFieldComponent {...props} />;
};

export const DateField = memo<DateFieldProps>(
  ({ minDate, name, label, required, fullWidth, TextFieldComponent, ...props }) => {
    const classes = useStyles();
    const utils = useUtils();

    const minDateResetriction: Moment | Date | null | undefined = useMemo(() => {
      if (isString(minDate)) {
        try {
          if (minDate === 'now') {
            return new Date();
          }

          return utils.parse(minDate, dateFormat);
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
          />
        );
      },
      [TextFieldComponent, fullWidth, name],
    );

    return (
      <KeyboardDatePicker
        {...props}
        autoOk
        label={label}
        format={dateFormat}
        variant="inline"
        required={required}
        minDate={minDateResetriction}
        minDateMessage={null}
        InputAdornmentProps={{ position: 'end', ...props.InputAdornmentProps }}
        KeyboardButtonProps={{
          classes: {
            label: classes.keyboardButtonLabel,
            ...props.KeyboardButtonProps?.classes,
          },
          ...props.KeyboardButtonProps,
        }}
        TextFieldComponent={TextFieldMemo}
      />
    );
  },
);
