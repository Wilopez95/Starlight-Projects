import React, { memo } from 'react';
import cs from 'classnames';
import { Trans } from '../../i18n';
import { isString } from 'lodash-es';
import FormControl from '@material-ui/core/FormControl';
import FormLabel, { FormLabelProps } from '@material-ui/core/FormLabel';
import MuiRadioGroup, { RadioGroupProps as MuiRadioGroupProps } from '@material-ui/core/RadioGroup';
import Box from '@material-ui/core/Box';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';

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
    readonly: {
      background: palette.grey[50],
    },
    formHelperTextRoot: {
      ...typography.body2,
      marginBottom: '-23px',
    },
    formControlInner: {},
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
    groupRoot: { flex: 1 },
  }),
  {
    name: 'RadioGroup',
  },
);

export interface RadioGroupProps extends MuiRadioGroupProps {
  name?: string;
  classes?: {
    root?: string;
    formControl?: string;
    groupRoot?: string;
    fieldLabelFormControl?: string;
  };
  touched?: boolean;
  error?: string | React.ReactNode;
  helperText?: React.ReactNode;
  children: React.ReactNode;
  label?: React.ReactNode;
  FormLabelProps?: Partial<FormLabelProps>;
  lineVariant?: boolean;
}

export const RadioGroup = memo<RadioGroupProps>((props) => {
  const {
    name,
    error,
    touched,
    onChange,
    helperText,
    value,
    children,
    label,
    FormLabelProps,
    classes: classesProp,
    lineVariant,
  } = props;
  const classes = useStyles({ classes: classesProp });

  const helperTextContent =
    (touched && error && ((isString(error) && <Trans>{error}</Trans>) || error)) || helperText;

  return (
    <FormControl
      component="fieldset"
      error={touched && !!error}
      classes={{
        root: cs(classesProp?.root, classes.rootFormControl, {
          [classes.lineVariant]: lineVariant,
        }),
      }}
    >
      <MuiRadioGroup
        row
        name={name}
        value={value}
        classes={{
          root: classes.groupRoot,
        }}
        onChange={onChange}
        onKeyPress={(e) => {
          if (['Space', 'Enter'].includes(e.nativeEvent.code)) {
            (e.target as HTMLElement).click();
          }
        }}
      >
        <FormLabel
          {...{ ...FormLabelProps, component: 'legend' }}
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
        <Box className={cs(classesProp?.formControl, classes.formControlInner)}>
          {React.Children.map(
            children,
            (child) =>
              (React.isValidElement(child) && React.cloneElement(child, { name })) || child,
          )}
          {helperTextContent && (
            <FormHelperText classes={{ root: classes.formHelperTextRoot }}>
              {helperTextContent}
            </FormHelperText>
          )}
        </Box>
      </MuiRadioGroup>
    </FormControl>
  );
});

export default RadioGroup;
