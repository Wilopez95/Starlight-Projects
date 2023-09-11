import React, { useCallback } from 'react';
import cx from 'classnames';

import { Button } from '../Button/Button';
import { Typography } from '../Typography/Typography';

import { IButtonSelect } from './types';

import styles from './css/styles.scss';

export const ButtonSelect: React.FC<IButtonSelect> = props => {
  const {
    items,
    className,
    value,
    onSelectionChange,
    name,
    error,
    noError,
    label,
    wrapperClassName,
    direction = 'row',
    id = name,
  } = props;

  const handleChange = useCallback(
    (_: unknown, value?: number | string) => {
      onSelectionChange(name, value);
    },
    [name, onSelectionChange],
  );

  return (
    <div className={cx(styles.wrapper, wrapperClassName)}>
      {label ? (
        <Typography
          color="secondary"
          variant="bodyMedium"
          as="label"
          shade="desaturated"
          htmlFor={id}
        >
          {label}
        </Typography>
      ) : null}
      <div
        className={cx(styles.buttonSelect, styles[direction], className)}
        style={{ flexDirection: direction }}
        data-error={error}
      >
        {items.map(({ label, value: itemValue }) => {
          return (
            <Button
              {...props}
              key={itemValue}
              className={cx(styles.button, {
                [styles.active]: value === itemValue,
              })}
              value={itemValue}
              borderless
              onClick={handleChange}
            >
              {label}
            </Button>
          );
        })}
      </div>
      {!noError ? (
        <div className={styles.validationText} role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
};
