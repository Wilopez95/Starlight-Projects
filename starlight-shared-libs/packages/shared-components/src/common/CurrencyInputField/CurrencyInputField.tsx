/* eslint-disable new-cap */
import React from 'react';
import cx from 'classnames';

import CurrencyInput from 'react-currency-input-field';
import { Layouts } from 'src/layouts';
import { Typography } from '../Typography/Typography';
import { ICurrencyInputField } from './types';

import styles from './css/styles.scss';

export const CurrencyInputField: React.FC<ICurrencyInputField> = ({
  id,
  name,
  label,
  noError,
  error,
  errorAlign,
  wrapClassName,
  className,
  half,
  allowDecimals,
  allowNegativeValue = false,
  defaultValue,
  value,
  onValueChange,
  placeholder,
  decimalsLimit,
  decimalScale,
  fixedDecimalLength,
  prefix,
  suffix,
  decimalSeparator,
  groupSeparator,
  intlConfig,
  disabled,
  // disableAbbreviations,
  // disableGroupSeparators,
  maxLength,
  step,
  // transformRawValue,
  countable,
  borderError,
  textAlign = 'left',
  children,
}) => {
  id = id ?? name;

  const inputComponent = (
    <CurrencyInput
      allowDecimals={allowDecimals}
      allowNegativeValue={allowNegativeValue}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      decimalsLimit={decimalsLimit}
      decimalScale={decimalScale}
      fixedDecimalLength={fixedDecimalLength}
      prefix={prefix}
      suffix={suffix}
      decimalSeparator={decimalSeparator}
      groupSeparator={groupSeparator}
      intlConfig={intlConfig}
      disabled={disabled}
      maxLength={maxLength}
      step={step}
      className={cx(styles.input, className, {
        [styles.error]: error,
        [styles.nonCountable]: !countable,
        [styles.onlyBorderError]: borderError,
        [styles[textAlign]]: textAlign,
      })}
    >
      {children}
    </CurrencyInput>
  );

  let labelElement;
  if (label) {
    labelElement = (
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
    );
  }

  let errorComponent;
  if (!noError) {
    errorComponent = (
      <Typography
        color="alert"
        variant="bodySmall"
        textAlign={errorAlign}
        className={styles.validationText}
      >
        {error}
      </Typography>
    );
  }
  return (
    <div className={cx(styles.wrap, { [styles.half]: half }, wrapClassName)}>
      {labelElement}
      {inputComponent}
      {errorComponent}
    </div>
  );
};
