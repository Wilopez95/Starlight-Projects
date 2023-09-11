import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { NavigationConfigItem, Button, Layouts } from '@starlightpro/shared-components';
import { TablePageContainer, TableTools } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { usePermission, useStores } from '@root/hooks';
import { Typography } from '@root/common';
import { PlusIcon } from '@root/assets';
import { useNavigationConfig } from './navigationConfig';
const I18N_PATH = 'pages.SystemConfiguration.tables.CompanySettings.Text.';
interface routeParams {
  id: string;
}

const IntegrationSettings: React.FC = () => {
  const { t } = useTranslation();
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const canViewCompanySettings = usePermission('configuration:company-settings:view');
  const { qbIntegrationSettingsStore, qbAccountsStore } = useStores();
  useEffect(() => {
    if (!canViewCompanySettings) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canViewCompanySettings]);
  const navConfig = useNavigationConfig();
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(navConfig[0]);
  const handleTabChange = useCallback((tab: NavigationConfigItem) => {
    setCurrentTab(tab);
  }, []);
  const Component = currentTab.component;
  const routeParams = useParams<routeParams>();
  const integrationId = Number(routeParams.id);
  const downloadQWCFile = useCallback(() => {
    qbIntegrationSettingsStore.generateQWC(integrationId);
  }, []);
  const addNewAccount = useCallback(() => {
    qbAccountsStore.toggleModal();
  }, []);
  return (
    <TablePageContainer>
      <Helmet title={t('Titles.QbIntegrationSettings')} />
      <Layouts.Margin top="2" bottom="2">
        <Layouts.Flex alignItems="center" justifyContent="space-between">
          <Typography as="h1" variant="headerTwo" fontWeight="bold">
            {t(`${I18N_PATH}IntegrationSettings`)}
          </Typography>
          <Layouts.Flex>
            <Layouts.Margin right="0.5">
              <Button onClick={downloadQWCFile} variant="primary">
                {'Download qwc file'}
              </Button>
            </Layouts.Margin>
            {currentTab.key !== 'DefaultAccounts' && currentTab.key != 'Parameters' ? (
              <Button
                onClick={addNewAccount}
                variant="primary"
                iconLeft={PlusIcon}
                buttonRef={newButtonRef}
              >
                {t(`${I18N_PATH}AddAccount`)}
              </Button>
            ) : null}
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Margin>
      {canViewCompanySettings ? (
        <>
          <TableTools.HeaderNavigation
            tabs={navConfig}
            selectedTab={currentTab}
            onChangeTab={handleTabChange}
          />
          {Component ? <Component newButtonRef={newButtonRef} /> : null}
        </>
      ) : null}
    </TablePageContainer>
  );
};

export default IntegrationSettings;
