import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { QbIntegrationQuickView } from '@root/quickViews';
import { QbIntegrationSettings } from '../../../../stores/qbIntegrationSettings/QbIntegrationSettings';

const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.QbIntegrationSettings.Text.';
const IntegrationSettings: React.FC = () => {
  const tbodyContainerRef = useRef(null);
  const { qbIntegrationSettingsStore, systemConfigurationStore } = useStores();
  const { t } = useTranslation();
  const selectedIntegration = qbIntegrationSettingsStore.selectedEntity;
  const loadDomains = useCallback(() => {
    qbIntegrationSettingsStore.request();
  }, [qbIntegrationSettingsStore]);

  useEffect(loadDomains, [loadDomains]);

  const openIntegrationSettings = (integration: QbIntegrationSettings) => {
    qbIntegrationSettingsStore.selectEntity(integration);
    qbIntegrationSettingsStore.toggleQuickView(true);
  };

  const onQuickViewClose = () => {
    qbIntegrationSettingsStore.cleanup();
    loadDomains();
  };

  return (
    <TableTools.ScrollContainer>
      <QbIntegrationQuickView
        clickOutContainers={tbodyContainerRef}
        isOpen={systemConfigurationStore.isCreating || qbIntegrationSettingsStore.isOpenQuickView}
        onAfterClose={onQuickViewClose}
      />
      <Table>
        <TableTools.Header>
          <TableTools.HeaderCell minWidth={150}>
            {t(`${I18N_PATH}Description`)}
          </TableTools.HeaderCell>
          <TableTools.HeaderCell minWidth={50}>{t(`${I18N_PATH}SystemType`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell minWidth={50}>{t(`${I18N_PATH}BUNames`)}</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody ref={tbodyContainerRef} cells={2} loading={qbIntegrationSettingsStore.loading}>
          {qbIntegrationSettingsStore.values.map(integration => (
            <TableRow
              key={integration.id}
              onClick={() => openIntegrationSettings(integration)}
              selected={selectedIntegration?.id === integration.id}
            >
              <TableCell>{integration.description}</TableCell>
              <TableCell>{integration.systemType}</TableCell>
              <TableCell>
                {integration.integrationBuList.length == 1
                  ? integration.integrationBuList
                  : `${integration.integrationBuList} `}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableTools.ScrollContainer>
  );
};

export default observer(IntegrationSettings);
