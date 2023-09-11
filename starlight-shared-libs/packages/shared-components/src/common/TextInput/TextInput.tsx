/* eslint-disable new-cap */
import React, { useCallback, useRef } from 'react';
import cx from 'classnames';

import { Layouts } from '../../layouts';
import { Typography } from '../Typography/Typography';

import { ITextInput, TextInputElement } from './types';

import styles from './css/styles.scss';

export const TextInput: React.FC<ITextInput> = ({
  wrapClassName,
  className,
  name,
  label,
  placeholder,
  readOnly,
  error,
  errorAlign,
  inputTextAlign = 'left',
  disabled,
  area,
  limits,
  lengthLimits,
  children,
  icon: Icon,
  rightIcon: RightIcon,
  inputContainerClassName,
  half,
  noError,
  countable,
  borderError,
  reverse,
  onBlur,
  onChange,
  onFocus,
  onRightImageClick,
  onKeyUp,
  onKeyDown,
  onClick,
  onClearError,
  id = name,
  autoComplete = 'off',
  type = 'text',
  value = '',
  ariaLabel,
  confirmed,
}) => {
  const Element = area ? 'textarea' : 'input';
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Prevent warnings from React about uncontrolled component.
  if (value === null) {
    value = '';
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      if (type === 'number' && e.key.toLowerCase() === 'e') {
        e.preventDefault();
      } else {
        onKeyDown && onKeyDown(e);
      }
    },
    [onKeyDown, type],
  );

  const handleIconFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<TextInputElement>) => {
      onClearError?.();
      onFocus?.(e);
    },
    [onClearError, onFocus],
  );

  const inputComponent = (
    <Element
      id={id}
      aria-label={ariaLabel}
      type={type}
      min={limits?.min}
      max={limits?.max}
      minLength={lengthLimits?.min}
      maxLength={lengthLimits?.max}
      className={cx(styles.input, className, {
        [styles.area]: area,
        [styles.error]: error,
        [styles.nonCountable]: !countable,
        [styles.onlyBorderError]: borderError,
        [styles[inputTextAlign]]: inputTextAlign,
      })}
      readOnly={readOnly}
      name={name}
      value={value}
      data-error={error}
      placeholder={placeholder}
      disabled={disabled}
      onChange={readOnly ? undefined : onChange}
      onBlur={onBlur}
      ref={inputRef}
      autoComplete={autoComplete}
      onFocus={handleInputFocus}
      onKeyUp={onKeyUp}
      onKeyDown={handleKeyDown}
      onClick={onClick}
    />
  );
  const rightIconProps = {
    className: cx({ [styles.hiddenIcon]: !value }),
    onFocus: handleIconFocus,
    tabIndex: -1,
    onClick: onRightImageClick,
  };

  return (
    <div className={cx(styles.wrap, { [styles.half]: half }, wrapClassName)}>
      {label ? (
        <Layouts.Margin top="0.5" bottom="0.5">
          <Typography
            color="secondary"
            as="label"
            shade="desaturated"
            variant="bodyMedium"
            htmlFor={id}
          >
            {label}
          </Typography>
        </Layouts.Margin>
      ) : null}
      {/** TODO remove this trash */}
      {reverse ? children : null}
      {Icon || RightIcon ? (
        <div
          className={cx(styles.inputContainer, inputContainerClassName, {
            [styles.leftIcon]: Icon,
            [styles.disabled]: disabled,
            [styles.readOnly]: readOnly,
            [styles.error]: error,
            [styles.onlyBorderError]: borderError,
            [styles.confirmed]: confirmed,
          })}
          data-container
        >
          {Icon ? <Icon onFocus={handleIconFocus} tabIndex={-1} /> : null}
          {inputComponent}
          {RightIcon ? RightIcon(rightIconProps) : null}
        </div>
      ) : (
        inputComponent
      )}

      {!noError ? (
        <Typography
          color="alert"
          variant="bodySmall"
          textAlign={errorAlign}
          className={styles.validationText}
        >
          {error}
        </Typography>
      ) : null}
      {!reverse ? children : null}
    </div>
  );
};
