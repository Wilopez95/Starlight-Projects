import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools/TableDivider';
import { Typography } from '@root/common/Typography/Typography';

import * as Styles from './styles';
import { ISaveChangesBoundaryConfirmModal } from './types';

const I18N_PATH = 'components.modals.QuickViewConfirm.Text.';

export const SaveChangesBoundaryConfirmModal: React.FC<ISaveChangesBoundaryConfirmModal> = ({
  title,
  isOpen,
  onClose,
  onLeave,
}) => {
  const { t } = useTranslation();

  return (
    <Styles.StyledConfirmModal isOpen={isOpen} onClose={onClose} shouldCloseOnEsc={false}>
      <Layouts.Padding padding="4">
        <Typography variant="headerTwo">{title ?? t(`${I18N_PATH}UnsavedChanges`)}</Typography>
        <Layouts.Margin top="1.5">
          <Typography variant="bodyMedium">{t(`${I18N_PATH}SubTitle`)}</Typography>
        </Layouts.Margin>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding padding="4">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}>{t('Text.Cancel')}</Button>
          <Button onClick={onLeave} variant="alert">
            {t('Text.Leave')}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Styles.StyledConfirmModal>
  );
};
