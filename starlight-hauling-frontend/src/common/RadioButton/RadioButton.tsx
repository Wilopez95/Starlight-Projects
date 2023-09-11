import React from 'react';

import { CustomInput } from '../CustomInput/CustomInput';

import { IRadioButton } from './types';

import styles from './css/styles.scss';

export const RadioButton: React.FC<IRadioButton> = ({
  children,
  value,
  onChange,
  labelClass = styles.label,
  inputClass = styles.hiddenInput,
  checkmarkClass = styles.checkmark,
  ...customInputProps
}) => (
  <CustomInput
    type="radio"
    checkmarkClass={checkmarkClass}
    inputClass={inputClass}
    labelClass={labelClass}
    checked={value}
    onChange={onChange}
    {...customInputProps}
  >
    {children ? <div className={styles.text}>{children}</div> : null}
  </CustomInput>
);
