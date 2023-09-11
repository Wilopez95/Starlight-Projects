import React, { forwardRef, memo, useCallback } from 'react';
import clsx from 'clsx';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import {
  TextFieldProps as MuiTextFieldProps,
  TextFieldClassKey as MuiTextFieldClassKey,
} from '@material-ui/core/TextField';

const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput,
};

export type TextFieldClassKey =
  | MuiTextFieldClassKey
  | 'inputBaseRoot'
  | 'inputBaseInput'
  | 'formControl'
  | 'input'
  | 'inputSuffix'
  | 'formControlInner'
  | 'formHelperTextRoot'
  | 'labelRoot';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'error'> {
  name?: string;
  variant?: MuiTextFieldProps['variant'];
  classes?: Partial<ClassNameMap<TextFieldClassKey>>;
  error?: string | React.ReactNode;
  touched?: boolean;
  readonly?: boolean;
  hideErrorText?: boolean;
  warning?: boolean;
  inputSuffix?: React.ReactNode;
  hideArrows?: boolean;
}

const useStyles = makeStyles(
  ({ palette, spacing, transitions, typography, shape }) => ({
    root: {},
    labelRoot: {},
    /* Pseudo-class applied to the label element if label has `focused={true}`. */
    labelFocused: {},
    /* Pseudo-class applied to the label element if label has `focused={true}`. */
    labelError: {},
    formControl: {
      position: 'relative',
      marginBottom: spacing(1),
      transform: 'none',
      ...typography.body2,

      '&$labelFocused': {
        color: palette.text.secondary,
      },
      '&$labelError': {
        color: palette.text.secondary,
      },

      '&[data-shrink=false] + $inputBaseRoot $inputBaseInput': {
        '&::-webkit-input-placeholder': 0.5,
        '&::-moz-placeholder': 0.5, // Firefox 19+
        '&:-ms-input-placeholder': 0.5, // IE 11
        '&::-ms-input-placeholder': 0.5, // Edge
      },
    },
    inputBaseRoot: {
      background: palette.background.paper,
      position: 'relative',
      padding: 0,
      boxShadow: `inset 0px 0px 0 1px ${palette.grey['300']}`,
      border: 'none',
      borderRadius: shape.borderRadius,
      '&:before': {
        zIndex: 10,
        content: '"\\00a0"',
        pointerEvents: 'none', // Transparent to the hover style.
        position: 'absolute',
        top: '0px',
        right: '0px',
        left: '0px',
        bottom: '0px',
        border: `1px solid ${palette.border?.hover ?? palette.text.primary}`,
        borderRadius: shape.borderRadius,
        opacity: 0,
        transition: transitions.create('opacity', {
          duration: transitions.duration.shorter,
        }),
      },
      '&:after': {
        zIndex: 1,
        content: '"\\00a0"',
        pointerEvents: 'none', // Transparent to the hover style.
        position: 'absolute',
        top: '0px',
        right: '0px',
        left: '0px',
        bottom: '0px',
        border: `1px solid ${palette.grey['300']}`,
        borderRadius: shape.borderRadius,
        opacity: 1,
        transition: transitions.create('opacity', {
          duration: transitions.duration.shorter,
        }),
      },
      '&:hover:not($disabled):before': {
        border: `1px solid ${palette.border?.hover ?? palette.text.primary}`,
        // boxShadow: `inset 0px 0px 0 1px ${palette.text.primary}`,
        opacity: 1,
      },
      'label + &': {
        marginTop: 4,
      },

      'label[data-shrink=false] + & $inputBaseInput': {
        '&::-webkit-input-placeholder': 0.5,
        '&::-moz-placeholder': 0.5, // Firefox 19+
        '&:-ms-input-placeholder': 0.5, // IE 11
        '&::-ms-input-placeholder': 0.5, // Edge
      },
    },
    readonly: {
      background: palette.grey[50],

      '&$focused:before': {
        borderColor: palette.border?.hover ?? palette.text.primary,
        borderWidth: 1,
      },
      '&$focused:hover:before': {
        borderColor: palette.border?.hover ?? palette.text.primary,
        borderWidth: 1,
      },
    },
    inputBaseInput: {
      fontSize: '14px',
      lineHeight: '20px',
      padding: spacing(1, 1.5),
      minHeight: '36px',
      boxSizing: 'border-box',
    },
    focused: {
      '&:before': {
        borderWidth: '2px',
        borderColor: palette.primary.main,
        opacity: 1,
      },
      '&:hover:not($disabled):before': {
        borderWidth: '2px',
        borderColor: palette.primary.main,
        opacity: 1,
      },
    },
    disabled: {
      background: palette.grey[50],
      '&:before': {
        borderWidth: '1px',
        borderColor: palette.grey[200],
        opacity: 1,
      },
      '&:hover:before': {
        borderWidth: '1px',
        borderColor: palette.grey[200],
        opacity: 1,
      },
    },
    error: {
      background: palette.background.errorLight,
      '&:before': {
        borderColor: palette.error.main,
        opacity: 1,
      },
      '&:hover:not($disabled):before': {
        borderColor: palette.error.main,
      },
      '&$focused:hover:before': {
        borderColor: palette.error.dark,
      },

      '& + $formHelperTextRoot': {
        color: palette.error.dark,
      },
    },
    warning: {
      '&:before': {
        borderColor: palette.warning.main,
        opacity: 1,
      },
      '&:hover:not($disabled):before': {
        borderColor: palette.warning.main,
      },
      '&$focused:hover:before': {
        borderColor: palette.warning.main,
      },

      '& + $formHelperTextRoot': {
        color: palette.orange,
      },
    },
    formHelperTextRoot: {
      ...typography.body2,
      marginBottom: '-23px',
    },
    fullWidthWrapper: {
      width: '100%',
    },
    formControlInner: {},
    selectIcon: {
      width: 18,
      height: 18,
      right: 10,
      color: palette.grey[500],
      top: 'calc(50% - 10px)',
    },
    inputWithSuffix: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputSuffix: {
      ...typography.body2,
      color: palette.text.secondary,
      paddingLeft: spacing(2),
    },
    hideArrows: {
      '&::-webkit-outer-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
      },
      '&::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
      },

      '-moz-appearance': 'textfield',
    },
    input: {},
  }),
  {
    name: 'TextField',
  },
);

/**
 * The `TextField` is a convenience wrapper for the most common cases (80%).
 * It cannot be all things to all people, otherwise the API would grow out of control.
 *
 * ## Advanced Configuration
 *
 * It's important to understand that the text field is a simple abstraction
 * on top of the following components:
 *
 * - [FormControl](/api/form-control/)
 * - [InputLabel](/api/input-label/)
 * - [FilledInput](/api/filled-input/)
 * - [OutlinedInput](/api/outlined-input/)
 * - [Input](/api/input/)
 * - [FormHelperText](/api/form-helper-text/)
 *
 * If you wish to alter the props applied to the `input` element, you can do so as follows:
 *
 * ```jsx
 * const inputProps = {
 *   step: 300,
 * };
 *
 * return <TextField id="time" type="time" inputProps={inputProps} />;
 * ```
 *
 * For advanced cases, please look at the source of TextField by clicking on the
 * "Edit this page" button above. Consider either:
 *
 * - using the upper case props for passing values directly to the components
 * - using the underlying components directly as shown in the demos
 */
const TextField = memo<TextFieldProps>(
  forwardRef((props, ref) => {
    const classes = useStyles(props);
    const {
      autoComplete,
      autoFocus = false,
      children,
      classes: classesProp,
      className,
      color = 'primary',
      defaultValue,
      disabled = false,
      error = false,
      FormHelperTextProps,
      fullWidth = false,
      helperText,
      hiddenLabel,
      id,
      InputLabelProps,
      inputProps,
      InputProps,
      inputRef,
      label,
      multiline = false,
      name,
      onBlur,
      onChange,
      onFocus,
      hideErrorText = false,
      placeholder,
      required = false,
      rows,
      rowsMax,
      select = false,
      SelectProps,
      type,
      value,
      variant = 'standard',
      touched,
      readonly,
      inputSuffix,
      warning,
      hideArrows,
      ...other
    } = props;

    if (process.env.NODE_ENV !== 'production') {
      if (select && !children) {
        // eslint-disable-next-line no-console
        console.error(
          'Material-UI: `children` must be passed when using the `TextField` component with `select`.',
        );
      }
    }

    const InputMore: any = {};

    if (variant === 'outlined') {
      if (InputLabelProps && typeof InputLabelProps.shrink !== 'undefined') {
        InputMore.notched = InputLabelProps.shrink;
      }

      if (label) {
        const displayRequired = InputLabelProps?.required ?? required;
        InputMore.label = (
          <React.Fragment>
            {label}
            {displayRequired && '\u00a0*'}
          </React.Fragment>
        );
      }
    }

    if (select) {
      // unset defaults from textbox inputs
      if (!SelectProps || !SelectProps.native) {
        InputMore.id = undefined;
      }
      InputMore['aria-describedby'] = undefined;
    }

    const onChangeFn = useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!event || !onChange) {
          return;
        }

        onChange(event);
      },
      [onChange],
    );

    const helperTextContent = (!hideErrorText && touched && error) || helperText;
    const inputId = id ?? name;
    const helperTextId = helperText && inputId ? `${id}-helper-text` : undefined;
    const inputLabelId = label && inputId ? `${id}-label` : undefined;
    const InputComponent = variantComponent[variant];
    const InputElement = (
      <InputComponent
        aria-describedby={helperTextId}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        fullWidth={fullWidth}
        multiline={multiline}
        name={name}
        rows={rows}
        rowsMax={rowsMax}
        type={type}
        value={value}
        id={inputId}
        inputRef={inputRef}
        onBlur={onBlur}
        onChange={onChangeFn}
        onFocus={onFocus}
        placeholder={placeholder}
        inputProps={{
          readOnly: readonly,
          ...inputProps,
        }}
        {...InputMore}
        {...InputProps}
        disableUnderline
        className={clsx({ [classes.warning]: warning })}
        classes={{
          root: clsx(classes.inputBaseRoot, classesProp?.formControl, {
            [classes.readonly]: InputProps?.readOnly,
          }),
          input: clsx(classes.inputBaseInput, classesProp?.input, {
            [classes.hideArrows]: hideArrows,
          }),
          focused: classes.focused,
          error: classes.error,
          disabled: classes.disabled,
        }}
      />
    );

    const inputContent = select ? (
      <Select
        aria-describedby={helperTextId}
        id={id}
        labelId={inputLabelId}
        value={!placeholder ? value : value || placeholder}
        input={InputElement}
        {...SelectProps}
        classes={{
          icon: classes.selectIcon,
          ...SelectProps?.classes,
        }}
        placeholder={placeholder}
        MenuProps={{
          anchorOrigin: {
            horizontal: 'center',
            vertical: 'bottom',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
          getContentAnchorEl: null,
          ...SelectProps?.MenuProps,
        }}
      >
        {children}
      </Select>
    ) : (
      InputElement
    );

    return (
      <FormControl
        className={clsx(classes?.root, className, classesProp?.root)}
        disabled={disabled}
        error={touched && !!error}
        fullWidth={fullWidth}
        hiddenLabel={hiddenLabel}
        ref={ref}
        required={required}
        color={color}
        variant={variant}
        {...other}
      >
        {label && (
          <InputLabel
            htmlFor={inputId}
            id={inputLabelId}
            {...InputLabelProps}
            shrink
            disableAnimation
            classes={{
              root: classesProp?.labelRoot,
              formControl: classes.formControl,
              focused: classes.labelFocused,
              error: classes.labelError,
              ...InputLabelProps?.classes,
            }}
          >
            {label}
          </InputLabel>
        )}

        <Box
          className={clsx(classes.formControlInner, classesProp?.formControlInner, {
            [classes.fullWidthWrapper]: fullWidth,
          })}
        >
          {(!!inputSuffix && (
            <Box className={classes.inputWithSuffix}>
              {inputContent}
              <Box className={classes.inputSuffix}>{inputSuffix}</Box>
            </Box>
          )) ||
            inputContent}

          {helperTextContent && (
            <FormHelperText
              id={helperTextId}
              {...FormHelperTextProps}
              classes={{
                root: classes.formHelperTextRoot,
              }}
            >
              {helperTextContent}
            </FormHelperText>
          )}
        </Box>
      </FormControl>
    );
  }),
);

export default TextField;
