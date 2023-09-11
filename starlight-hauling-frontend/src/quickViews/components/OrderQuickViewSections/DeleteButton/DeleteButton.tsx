import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { DeleteIcon } from '@root/assets';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { IDeleteButton } from './types';

export const DeleteButton: React.FC<IDeleteButton> = ({ onClick, disabled }) => {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onClick?.();
      }
    },
    [onClick],
  );

  return (
    <Layouts.Flex justifyContent="center" alignItems="center">
      <Layouts.IconLayout remove disabled={disabled} right="0">
        <DeleteIcon
          role="button"
          tabIndex={disabled ? 0 : -1}
          aria-label={t('Text.Remove')}
          onKeyDown={disabled ? undefined : handleKeyDown}
          onClick={disabled ? undefined : onClick}
        />
      </Layouts.IconLayout>
    </Layouts.Flex>
  );
};
