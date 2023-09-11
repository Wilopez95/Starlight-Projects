import React from 'react';
import { useTranslation } from 'react-i18next';

import { Protected } from '@root/common';

import ConfirmModal from '../Confirm/Confirm';

import { IOverrideSubscriptionLimit } from './types';

const I18N_PATH = 'components.modals.OverrideSubscriptionLimit.Text.';

export const OverrideSubscriptionLimit: React.FC<IOverrideSubscriptionLimit> = ({
  subTitle,
  isOpen,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const commonConfirmModalProps = {
    cancelButton: t('Text.Cancel'),
    title: t('Titles.CreditOverlimit'),
    nonDestructive: true,
    isOpen,
    onCancel,
    onSubmit,
  };

  return (
    <Protected
      permissions="subscriptions:override-credit-limit:perform"
      fallback={
        <ConfirmModal
          {...commonConfirmModalProps}
          subTitle={t(`${I18N_PATH}SubTitleInsufficientPrivileges`)}
        />
      }
    >
      <ConfirmModal
        {...commonConfirmModalProps}
        submitButton={t('Text.OverrideLimit')}
        subTitle={subTitle ?? t(`${I18N_PATH}SubTitle`)}
      />
    </Protected>
  );
};
