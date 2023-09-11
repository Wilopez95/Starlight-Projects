import React from 'react';
import { useHistory } from 'react-router';
import { RouteModules, Routes } from '@root/consts';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import { useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { useBoolean, useStores } from '@root/hooks';
import { IQbIntegration } from '@root/types';

const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.Domains.DomainsQuickView.Text.';

const QbIntegrationQuickViewActions: React.FC = () => {
  const history = useHistory();
  const { values } = useFormikContext<IQbIntegration>();
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const { t } = useTranslation();
  const { systemConfigurationStore, qbIntegrationSettingsStore } = useStores();
  const [isConfirmDeleteModalOpen, openConfirmDeleteModal, closeConfirmDeleteModal] =
    useBoolean(false);
  const isEntitySelected = !!qbIntegrationSettingsStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;

  const handleDelete = async () => {
    const integration = qbIntegrationSettingsStore.selectedEntity;
    if (integration) {
      try {
        await qbIntegrationSettingsStore.delete(integration.id);
        forceCloseQuickView();
      } catch (error) {}
    }
  };

  const editIntegration = () => {
    const integration = qbIntegrationSettingsStore.selectedEntity;
    if (integration) {
      qbIntegrationSettingsStore.unSelectEntity();
      qbIntegrationSettingsStore.toggleQuickView(false);
      history.push(
        `${RouteModules.SystemConfiguration}/${Routes.IntegrationSettings}/${integration.id}`,
      );
    }
  };

  const save = async () => {
    try {
      await qbIntegrationSettingsStore.create(
        values.integrationBuList as string,
        values.password,
        values.dateToAdjustment,
        values.lastSuccessfulIntegration,
        values.description,
        values.systemType,
        values.integrationPeriod,
      );
      forceCloseQuickView();
    } catch (err) {}
  };

  const update = async () => {
    const integration = qbIntegrationSettingsStore.selectedEntity;
    if (integration) {
      try {
        await qbIntegrationSettingsStore.update(values, integration.id);
        forceCloseQuickView();
      } catch (err) {}
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmDeleteModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t('Text.Delete')}
        title={t(`${I18N_PATH}ConfirmDomainRemoval`)}
        subTitle={t(`${I18N_PATH}AreYouSure`, { name: values.dateToAdjustment })}
        onCancel={closeConfirmDeleteModal}
        onSubmit={handleDelete}
      />
      <Layouts.Flex justifyContent="space-between">
        <Button onClick={closeQuickView}>{t('Text.Cancel')}</Button>
        {!isCreating && isEntitySelected ? (
          <>
            <Button onClick={openConfirmDeleteModal} variant="converseAlert">
              {t('Text.Delete')}
            </Button>
            <Button onClick={editIntegration}>{t('Text.EditSettings')}</Button>
          </>
        ) : null}
        <Button onClick={!isEntitySelected ? save : update} type="submit" variant="success">
          {t('Text.Save')}
        </Button>
      </Layouts.Flex>
    </>
  );
};

export default observer(QbIntegrationQuickViewActions);
