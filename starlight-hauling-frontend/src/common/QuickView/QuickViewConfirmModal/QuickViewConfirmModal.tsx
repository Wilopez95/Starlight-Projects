import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools/TableDivider';
import { Typography } from '@root/common/Typography/Typography';

import { useQuickViewContext } from '../QuickView/context';

import * as Styles from './styles';
import { IQuickViewConfirmModal } from './types';

const I18N_PATH = 'components.modals.QuickViewConfirm.Text.';

export const QuickViewConfirmModal: React.FC<IQuickViewConfirmModal> = ({
  title,
  subTitle,
  cancelButtonText,
  submitButtonText,
}) => {
  const { isModalOpen, closeModal, forceCloseQuickView } = useQuickViewContext();
  const { t } = useTranslation();

  return (
    <Styles.StyledConfirmModal isOpen={isModalOpen} onClose={closeModal} shouldCloseOnEsc={false}>
      <Layouts.Padding padding="4">
        <Typography variant="headerTwo">{title ?? t(`${I18N_PATH}UnsavedChanges`)}</Typography>
        <Layouts.Margin top="1.5">
          <Typography variant="bodyMedium">{subTitle ?? t(`${I18N_PATH}SubTitle`)}</Typography>
        </Layouts.Margin>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding padding="4">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={closeModal}>{cancelButtonText ?? t('Text.Cancel')}</Button>
          <Button onClick={forceCloseQuickView} variant="alert">
            {submitButtonText ?? t('Text.Leave')}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Styles.StyledConfirmModal>
  );
};
