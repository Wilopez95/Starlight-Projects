import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { noop } from 'lodash-es';

import { Layouts } from '../../layouts';

import { Button as ButtonLayout } from './layout/Button';
import { IButton } from './types';

export const Button: React.FC<IButton> = ({
  iconLeft: IconLeft,
  iconRight: IconRight,
  children: baseChildren,
  disabled,
  buttonRef,
  to,
  full,
  className,
  variant,
  loading,
  onClick,
  size = 'medium',
  type = 'button',
  value = '',
}) => {
  const history = useHistory();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      onClick?.(e, value);
      if (to) {
        history.push(to);
      }
    },
    [onClick, value, to, history],
  );

  return (
    <ButtonLayout
      type={type}
      ref={buttonRef}
      full={full}
      variant={variant}
      className={className}
      size={size}
      onClick={disabled || loading ? noop : handleClick}
      disabled={disabled}
      loading={loading}
    >
      <Layouts.Padding left="1" right="1">
        <Layouts.Flex alignItems="center" justifyContent="center" className="button-content">
          {IconLeft ? (
            <Layouts.Margin right="1">
              <IconLeft />
            </Layouts.Margin>
          ) : null}
          <div>{baseChildren}</div>
          {IconRight ? (
            <Layouts.Margin left="1">
              <IconRight />
            </Layouts.Margin>
          ) : null}
        </Layouts.Flex>
      </Layouts.Padding>
    </ButtonLayout>
  );
};
