import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { useBoolean, useStores } from '@root/hooks';
import { IDomain } from '@root/types';

const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.Domains.DomainsQuickView.Text.';

const DomainsQuickViewActions: React.FC = () => {
  const { isValidating, values } = useFormikContext<IDomain>();
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const { t } = useTranslation();
  const { systemConfigurationStore, domainStore } = useStores();
  const [isConfirmDeleteModalOpen, openConfirmDeleteModal, closeConfirmDeleteModal] =
    useBoolean(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedDomain = domainStore.selectedEntity;

  const isNew = !selectedDomain || systemConfigurationStore.isCreating;

  const handleDelete = async () => {
    if (selectedDomain) {
      setIsDeleting(true);

      await domainStore.delete(selectedDomain.id);

      setIsDeleting(false);
      forceCloseQuickView();
      domainStore.request();
    }
  };

  let submitText = t(`Text.Close`);

  if (isNew) {
    submitText = t(`${I18N_PATH}AuthenticateDomain`);
  } else if (selectedDomain?.validationStatus === 'pending') {
    submitText = t(`${I18N_PATH}RequestStatusUpdate`);
  }

  const isButtonDisabled = isValidating || isDeleting;

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmDeleteModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t('Text.Delete')}
        title={t(`${I18N_PATH}ConfirmDomainRemoval`)}
        subTitle={t(`${I18N_PATH}AreYouSure`, { name: values.name })}
        onCancel={closeConfirmDeleteModal}
        onSubmit={handleDelete}
      />
      <Layouts.Flex justifyContent="space-between">
        {isNew ? (
          <Button onClick={closeQuickView} disabled={isButtonDisabled}>
            {t('Text.Cancel')}
          </Button>
        ) : (
          <Button onClick={openConfirmDeleteModal} disabled={isButtonDisabled}>
            {t('Text.Delete')}
          </Button>
        )}
        <Button type="submit" variant={isNew ? 'success' : 'primary'} disabled={isButtonDisabled}>
          {submitText}
        </Button>
      </Layouts.Flex>
    </>
  );
};

export default observer(DomainsQuickViewActions);
