import React from 'react';
import cx from 'classnames';

import { CustomInput } from '../CustomInput/CustomInput';

import { ICheckbox } from './types';

import styles from './css/styles.scss';

export const Checkbox: React.FC<ICheckbox> = ({
  name,
  children,
  checkmarkClass,
  labelClass,
  inputClass,
  onChange,
  value = false,
  error,
  ...customInputProps
}) => (
  <CustomInput
    type="checkbox"
    checkmarkClass={cx(styles.checkmark, checkmarkClass)}
    inputClass={cx(styles.hiddenInput, inputClass, {
      [styles.error]: !!error,
    })}
    labelClass={cx(styles.label, labelClass)}
    checked={value}
    onChange={onChange}
    name={name}
    error={error}
    {...customInputProps}
  >
    {children ? <div className={styles.text}>{children}</div> : null}
    {!children ? <div className={styles.visuallyHidden}>{name}</div> : null}
  </CustomInput>
);
