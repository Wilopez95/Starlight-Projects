import React, { useCallback } from 'react';
import { Button } from '@starlightpro/shared-components';
import cx from 'classnames';

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
  } = props;

  const handleChange = useCallback(
    (_: unknown, newValue?: number | string) => {
      onSelectionChange(name, newValue);
    },
    [name, onSelectionChange],
  );

  return (
    <div className={cx(styles.wrapper, wrapperClassName)}>
      {label ? (
        <Typography color="secondary" variant="bodyMedium" shade="desaturated">
          {label}
        </Typography>
      ) : null}
      <div
        className={cx(styles.buttonSelect, styles[direction], className)}
        style={{ flexDirection: direction }}
        data-error={error}
      >
        {items.map(({ label: newLabel, value: itemValue }) => {
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
              {newLabel}
            </Button>
          );
        })}
      </div>
      {noError === false || noError === undefined ? (
        <div className={styles.validationText} role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
};
