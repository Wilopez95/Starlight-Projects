import React, { memo, ReactElement, useCallback } from 'react';
import cs from 'classnames';
import { KeyboardTimePicker, KeyboardTimePickerProps } from '@material-ui/pickers';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { makeStyles } from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@starlightpro/common/components/TextField';

export interface TimeFieldProps extends KeyboardTimePickerProps {
  label?: string | ReactElement;
  required?: boolean;
  fullWidth?: boolean;
  classes?: TextFieldProps['classes'];
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
  return <TextField {...props} />;
});

export const TimeField = memo<TimeFieldProps>(({ name, classes: classesProp, ...props }) => {
  const classes = useStyles();

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
      keyboardIcon={<ScheduleIcon />}
      variant="inline"
      TextFieldComponent={TextFieldMemo}
      InputAdornmentProps={{
        classes: {
          positionEnd: classes.inputAdornmentPositionEnd,
        },
      }}
      KeyboardButtonProps={{
        classes: {
          root: classes.buttonRoot,
          label: classes.keyboardButtonLabel,
        },
      }}
    />
  );
});
