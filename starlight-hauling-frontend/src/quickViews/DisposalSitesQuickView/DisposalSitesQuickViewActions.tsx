import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { IDisposalSiteFormData } from './formikData';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.DisposalSites.QuickView.');

const DisposalSitesQuickViewActions: React.FC = () => {
  const { disposalSiteStore, systemConfigurationStore } = useStores();

  const selectedDisposalSite = disposalSiteStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedDisposalSite;

  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit, values } = useFormikContext<IDisposalSiteFormData>();
  const { t } = useTranslation();

  const [, canUpdateDisposalSites, canCreateDisposalSites] = useCrudPermissions(
    'configuration',
    'disposal-sites',
  );

  const customButtons = useMemo(
    () =>
      selectedDisposalSite && values.recycling
        ? [
            {
              buttonText: t(`${I18N_PATH.Form}MaterialsMapping`),
              handler: selectedDisposalSite.openMapping,
            },
          ]
        : [],
    [selectedDisposalSite, t, values.recycling],
  );

  return (
    <ButtonContainer
      isCreating={isNew}
      onCancel={closeQuickView}
      onSave={
        (!isNew && canUpdateDisposalSites) || canCreateDisposalSites
          ? () => {
              handleSubmit();
            }
          : undefined
      }
      customEditActions={customButtons}
      customCreateActions={customButtons}
    />
  );
};

export default observer(DisposalSitesQuickViewActions);
