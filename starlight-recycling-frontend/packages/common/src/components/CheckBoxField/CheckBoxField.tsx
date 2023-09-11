import React, { ReactNode, memo } from 'react';
import cs from 'classnames';
import FormControlLabel, {
  FormControlLabelProps,
  FormControlLabelClassKey,
} from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';

export interface CheckBoxFieldProps extends Omit<FormControlLabelProps, 'label' | 'control'> {
  name?: string;
  type?: string;
  label?: ReactNode;
  value?: string | number;
  fieldLabel?: ReactNode;
  id?: string;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
  lineVariant?: boolean;
  color?: CheckboxProps['color'];
  classes?: Partial<
    ClassNameMap<
      | FormControlLabelClassKey
      | 'formControlInner'
      | 'fieldLabel'
      | 'formControlRoot'
      | 'formControl'
    >
  >;
  indeterminate?: boolean;
}

const useStyles = makeStyles(
  ({ palette, typography, spacing }) => ({
    formControl: {
      position: 'relative',
      transform: 'none',
      color: palette.text.secondary,
      ...typography.body2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    rectangle: {
      display: 'block',
      width: '16px',
      height: '16px',
      borderRadius: '3px',
      border: 'solid 1px',
      backgroundColor: palette.common.white,
      color: palette.text.secondary,
    },
    checkMark: {
      display: 'block',
      width: '10px',
      height: '6px',
      borderBottom: 'solid 2px',
      borderLeft: 'solid 2px',
      transform: 'rotate(-45deg) translate(0px, 3px)',
    },
    indeterminate: {
      display: 'block',
      width: '8px',
      height: '2px',
      border: 'solid 1px',
      transform: 'translate(3px, 6px)',
    },
    statusFieldColHeader: {
      width: 100,
    },
    lineVariant: {},
    fieldLabelFormControl: {
      position: 'relative',
      transform: 'none',
      color: palette.text.secondary,
      ...typography.body2,

      '&$lineVariant': {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'stretch',
        display: 'flex',

        '& $fieldLabel': {
          flex: '1 1',
          maxWidth: 268,
          marginTop: spacing(1),
        },

        '& $formControlInner': {
          flex: '1 1',
        },
      },
    },
    formControlInner: {},
    labelRoot: {},
    formControlRoot: {},
    labelFocused: {},
    fieldLabel: {
      position: 'relative',
      transform: 'none',
      '&$labelFocused': {
        color: palette.text.secondary,
      },
      ...typography.body2,
    },
    checked: {
      '&$colorPrimary $rectangle': {
        color: palette.primary.main,
      },
      '&$colorSecondary $rectangle': {
        color: palette.secondary.main,
      },
    },
    disabled: {},
    root: {},
    colorPrimary: {},
    colorSecondary: {},
  }),
  { name: 'CheckBoxField' },
);

export const CheckBoxField = memo<CheckBoxFieldProps>(
  ({
    label,
    id,
    className,
    readOnly,
    disabled,
    fieldLabel,
    lineVariant,
    classes: classesProp,
    indeterminate,
    color = 'primary',
    checked,
    onChange,
    ...other
  }) => {
    const classes = useStyles({ classes: classesProp });

    const [check, setCheck] = React.useState(checked);

    const handleChange = (event: React.ChangeEvent<{}>, checked: boolean) => {
      setCheck(checked);

      if (onChange) {
        onChange(event, checked);
      }
    };

    const content = (
      <FormControlLabel
        {...other}
        control={
          <Checkbox
            id={id}
            color={color}
            indeterminate={indeterminate}
            inputProps={{ readOnly: readOnly }}
            disabled={disabled}
            classes={{
              checked: classes.checked,
              colorPrimary: classes.colorPrimary,
              colorSecondary: classes.colorSecondary,
            }}
            indeterminateIcon={
              <span className={classes.rectangle}>
                <span className={classes.indeterminate}></span>
              </span>
            }
            icon={<span className={classes.rectangle}></span>}
            checkedIcon={
              <span className={classes.rectangle}>
                <span className={classes.checkMark}></span>
              </span>
            }
          />
        }
        label={label}
        className={className}
        disabled={disabled}
        checked={check}
        onChange={handleChange}
        classes={{
          root: classes.formControlRoot,
          label: classes.formControl,
        }}
      />
    );

    if (fieldLabel) {
      return (
        <FormControl
          classes={{
            root: cs(classes.fieldLabelFormControl, { [classes.lineVariant]: lineVariant }),
          }}
        >
          <FormLabel
            classes={{
              root: classes.fieldLabel,
              focused: classes.labelFocused,
            }}
          >
            {fieldLabel}
          </FormLabel>
          <Box className={cs(classes.formControlInner, classesProp?.formControlInner)}>
            {content}
          </Box>
        </FormControl>
      );
    }

    return content;
  },
);

export default CheckBoxField;
