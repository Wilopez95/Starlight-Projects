import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import * as Styles from './styles';
import { IInputOperation } from './types';

export const InputOperations: React.FC<IInputOperation> = ({
  onDecrement,
  onIncrement,
  active,
  disabled,
}) => {
  const { t } = useTranslation();

  const handleIncrementKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onIncrement(e);
      }
    },
    [onIncrement],
  );

  const handleDecrementKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onDecrement(e);
      }
    },
    [onDecrement],
  );

  return (
    <Layouts.Margin right="0.5">
      <Layouts.Flex direction="column">
        <Styles.OperationButton
          onClick={onIncrement}
          onKeyDown={handleIncrementKeyDown}
          type="button"
          aria-label={t('Text.Increase')}
          active={active}
          disabled={disabled}
          tabIndex={0}
          plus
        />
        <Styles.OperationButton
          onClick={onDecrement}
          onKeyDown={handleDecrementKeyDown}
          type="button"
          aria-label={t('Text.Decrease')}
          active={active === false}
          disabled={disabled}
          tabIndex={0}
        />
      </Layouts.Flex>
    </Layouts.Margin>
  );
};
