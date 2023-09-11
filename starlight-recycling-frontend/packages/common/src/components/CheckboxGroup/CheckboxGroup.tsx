import React, { memo } from 'react';
import cs from 'classnames';
import { Trans } from 'react-i18next';
import { isString } from 'lodash-es';
import FormControl from '@material-ui/core/FormControl';
import FormLabel, { FormLabelProps } from '@material-ui/core/FormLabel';
import Box from '@material-ui/core/Box';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';
import { FormGroup } from '@material-ui/core';

const useStyles = makeStyles(
  ({ palette, typography, spacing }) => ({
    root: {},
    /* Pseudo-class applied to the label element if label has `focused={true}`. */
    labelFocused: {},
    /* Pseudo-class applied to the label element if label has `focused={true}`. */
    labelError: {},
    lineVariant: {},
    formControl: {
      position: 'relative',
      transform: 'none',
      ...typography.body2,

      '&$labelFocused': {
        color: palette.text.secondary,
      },
      '&$labelError': {
        color: palette.text.secondary,
      },
    },
    formHelperTextRoot: {
      ...typography.body2,
      marginBottom: '-23px',
    },
    formControlInner: {
      overflow: 'hidden',
    },
    fieldLabelFormControl: {},
    rootFormControl: {
      '&$lineVariant': {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'stretch',
        display: 'flex',

        '& $fieldLabelFormControl': {
          flex: '1 1',
          maxWidth: 268,
          marginTop: spacing(1),
        },

        '& $formControlInner': {
          flex: '1 1',
        },
      },
    },
    groupRoot: {},
  }),
  {
    name: 'CheckboxGroup',
  },
);

export interface CheckboxGroupProps {
  name: string;
  required?: boolean;
  classes?: {
    root?: string;
    formControl?: string;
    groupRoot?: string;
    fieldLabelFormControl?: string;
    formHelperTextRoot?: string;
    formControlInner?: string;
  };
  touched?: boolean;
  error?: string | React.ReactNode;
  helperText?: React.ReactNode;
  children: React.ReactNode;
  label?: React.ReactNode;
  FormLabelProps?: Partial<FormLabelProps>;
  lineVariant?: boolean;
}

export const CheckboxGroup = memo<CheckboxGroupProps>((props) => {
  const {
    error,
    touched,
    helperText,
    children,
    label,
    FormLabelProps,
    classes: classesProp,
    lineVariant,
    required,
  } = props;
  const classes = useStyles({ classes: classesProp });

  const helperTextContent =
    (touched && error && ((isString(error) && <Trans>{error}</Trans>) || error)) || helperText;

  return (
    <FormControl component="fieldset" error={touched && !!error}>
      <FormGroup
        classes={{
          root: cs(classes.root, classes.rootFormControl, {
            [classes.lineVariant]: lineVariant,
          }),
        }}
      >
        <FormLabel
          {...{ ...FormLabelProps, component: 'legend' }}
          required={required}
          classes={{
            ...FormLabelProps?.classes,
            root: cs(
              classes.formControl,
              FormLabelProps?.classes?.root,
              classes.fieldLabelFormControl,
            ),
            focused: classes.labelFocused,
            error: classes.labelError,
          }}
        >
          {label}
        </FormLabel>
        <Box className={cs(classes.formControlInner)}>
          <Box className={classes.groupRoot}>{children}</Box>
          {helperTextContent && (
            <FormHelperText classes={{ root: classes.formHelperTextRoot }}>
              {helperTextContent}
            </FormHelperText>
          )}
        </Box>
      </FormGroup>
    </FormControl>
  );
});

export default CheckboxGroup;
