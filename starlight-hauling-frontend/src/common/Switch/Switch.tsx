import React from 'react';
import cx from 'classnames';
import { noop } from 'lodash-es';

import { CustomInput } from '../CustomInput/CustomInput';

import { ISwitch } from './types';

import styles from './css/styles.scss';

export const Switch: React.FC<ISwitch> = ({
  name,
  children,
  checkmarkClass,
  labelClass,
  inputClass,
  small,
  disabled,
  onChange,
  value = false,
  ...customInputProps
}) => (
  <CustomInput
    type="checkbox"
    checkmarkClass={checkmarkClass}
    inputClass={cx(styles.hiddenInput, inputClass)}
    labelClass={cx(styles.switch, labelClass, { [styles.disabled]: disabled })}
    checked={value}
    onChange={disabled ? noop : onChange}
    name={name}
    {...customInputProps}
  >
    <div className={cx(styles.slider, small && styles.small)} />
    {children ? <div className={styles.text}>{children}</div> : null}
  </CustomInput>
);
