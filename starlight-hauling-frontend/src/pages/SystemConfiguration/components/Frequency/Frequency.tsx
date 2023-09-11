import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { DeleteIcon } from '@root/assets';
import { Typography } from '@root/common';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { IFrequency } from '@root/types';

import { getFrequencyText } from './helpers';

interface IFrequencyInteractive extends Omit<IFrequency, 'id' | 'createdAt' | 'updatedAt'> {
  onRemoveClick?(): void;
}

export const Frequency: React.FC<IFrequencyInteractive> = ({ type, times, onRemoveClick }) => {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onRemoveClick?.();
      }
    },
    [onRemoveClick],
  );

  return (
    <Layouts.Flex direction="row" justifyContent="space-between">
      <Typography variant="bodyMedium" color="secondary" shade="light">
        {getFrequencyText(t, type, times)}
      </Typography>
      {onRemoveClick ? (
        <Layouts.IconLayout remove>
          <DeleteIcon
            role="button"
            tabIndex={0}
            aria-label={t('Text.Remove')}
            onKeyDown={handleKeyDown}
            onClick={onRemoveClick}
          />
        </Layouts.IconLayout>
      ) : null}
    </Layouts.Flex>
  );
};
