import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { useBoolean, useCrudPermissions, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { IThirdPartyHauler } from '@root/types';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.ThirdPartyHaulers.QuickView.');

const ThirdPartyHaulersQuickViewActions: React.FC = () => {
  const [_, canUpdateHaulers] = useCrudPermissions('configuration', 'third-party-haulers');
  const { systemConfigurationStore, thirdPartyHaulerStore } = useStores();
  const { t } = useTranslation();

  const { handleSubmit, values, isSubmitting } = useFormikContext<IThirdPartyHauler>();
  const { closeQuickView } = useQuickViewContext();

  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useBoolean();

  const handleDelete = useCallback(async () => {
    await thirdPartyHaulerStore.delete(values.id);
    closeDeleteModal();
    closeQuickView();
  }, [closeDeleteModal, closeQuickView, thirdPartyHaulerStore, values.id]);

  const selectedThirdPartyHauler = thirdPartyHaulerStore.selectedEntity;
  const isNew = systemConfigurationStore.isCreating || !selectedThirdPartyHauler;

  if (!canUpdateHaulers) {
    return null;
  }

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t(`${I18N_PATH.Text}Delete3rdPartyHauler`)}
        title={t(`${I18N_PATH.Text}Delete3rdPartyHauler`)}
        subTitle={t(`${I18N_PATH.Text}AreYouSure`)}
        onCancel={closeDeleteModal}
        onSubmit={handleDelete}
      />
      <ButtonContainer
        isCreating={isNew}
        onCancel={closeQuickView}
        disabled={isSubmitting}
        onDelete={selectedThirdPartyHauler?.active ? undefined : openDeleteModal}
        onSave={() => {
          handleSubmit();
        }}
      />
    </>
  );
};

export default observer(ThirdPartyHaulersQuickViewActions);
