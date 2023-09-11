import React, { useCallback } from 'react';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { Button, makeStyles, Box } from '@material-ui/core';
import DateField from '../../../components/DateField';
import { TimeField } from '../../../components/TimeField';
import { ReadOnlyOrderFormComponent } from '../types';
import moment from 'moment';
import FormErrorText from '@starlightpro/common/components/FormErrorText';

const useStyles = makeStyles(
  ({ palette, spacing }) => ({
    pickerInputRoot: {
      width: 140,
    },
    inputAdornedEnd: {
      margin: 0,
    },
    nowButton: {
      marginTop: 28,
    },
    nowButtonLabel: {
      color: palette.primary.main,
    },
    horizontalSpacing: {
      paddingRight: spacing(2),
    },
    errorFormHelperText: {
      position: 'absolute',
    },
    field: {
      marginBottom: 0,
    },
    root: {
      marginBottom: spacing(4),
      display: 'flex',
      flexDirection: 'column',
    },
  }),
  { name: 'DateAndTimeInputInput' },
);

interface DateAndTimeInputInputProps extends ReadOnlyOrderFormComponent {
  name: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
}

export const DateAndTimeInputInput: React.FC<DateAndTimeInputInputProps> = ({
  readOnly,
  name,
  minDate,
  maxDate,
  required,
}) => {
  const classes = useStyles();
  const {
    input,
    meta: { error, touched },
  } = useField(name, { subscription: { value: true, error: true, touched: true } });

  const handleNowClick = useCallback(() => {
    input.onChange({ target: { name, value: new Date() } });
    input.onBlur();
  }, [input, name]);

  const onChange = useCallback(
    (date) => {
      if (minDate && moment(minDate).isAfter(date)) {
        return;
      }

      if (maxDate && moment(maxDate).isBefore(date)) {
        return;
      }

      input.onChange({ target: { name, value: date } });
    },
    [input, maxDate, minDate, name],
  );

  return (
    <Box className={classes.root}>
      <Box display="flex" flexDirection="row" alignItems="flex-start">
        <DateField
          disabled={readOnly}
          value={input.value || null}
          onChange={onChange}
          onClose={input.onBlur}
          onBlur={input.onBlur}
          required={required}
          minDate={minDate}
          maxDate={maxDate}
          className={classes.field}
          InputAdornmentProps={{
            classes: {
              positionEnd: classes.inputAdornedEnd,
            },
          }}
          InputProps={{
            classes: {
              root: classes.pickerInputRoot,
            },
          }}
          label={<Trans>Date</Trans>}
          invalidDateMessage=""
          maxDateMessage=""
          minDateMessage=""
        />
        <Box className={classes.horizontalSpacing} />
        <TimeField
          disabled={readOnly}
          required={required}
          value={input.value || null}
          onChange={onChange}
          onClose={input.onBlur}
          onBlur={input.onBlur}
          label={<Trans>Time</Trans>}
          className={classes.field}
          InputAdornmentProps={{
            classes: {
              positionEnd: classes.inputAdornedEnd,
            },
          }}
          InputProps={{
            classes: {
              root: classes.pickerInputRoot,
            },
          }}
          invalidDateMessage=""
          maxDateMessage=""
          minDateMessage=""
        />
        <Box className={classes.horizontalSpacing} />
        <Button
          disabled={readOnly}
          onClick={handleNowClick}
          variant="outlined"
          className={classes.nowButton}
          classes={{
            label: classes.nowButtonLabel,
          }}
        >
          <Trans>Now</Trans>
        </Button>
      </Box>
      <Box>
        <FormErrorText
          classes={{ root: classes.errorFormHelperText }}
          touched={touched}
          error={error}
        />
      </Box>
    </Box>
  );
};
