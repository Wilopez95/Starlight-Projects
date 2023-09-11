import React from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '../Confirm/Confirm';

import { IConfirmMissingSubscriptionOrderModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.modals.ConfirmMissingSubscriptionOrder.Text.';

const ConfirmMissingSubscriptionOrderModal: React.FC<IConfirmMissingSubscriptionOrderModal> = ({
  isOpen,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      className={styles.modal}
      isOpen={isOpen}
      cancelButton={t(`Text.Cancel`)}
      submitButton={t('Text.Proceed')}
      nonDestructive
      title={t(`${I18N_PATH}Title`)}
      subTitle={t(`${I18N_PATH}SubTitle`)}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
};

export default ConfirmMissingSubscriptionOrderModal;
