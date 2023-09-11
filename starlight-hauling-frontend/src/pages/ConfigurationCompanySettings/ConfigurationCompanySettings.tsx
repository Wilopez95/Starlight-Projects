import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { TablePageContainer, TableTools } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { usePermission } from '@root/hooks';
import { PageHeader } from '@root/pages/SystemConfiguration/components';

import { useNavigationConfig } from './navigationConfig';

const I18N_PATH = 'pages.SystemConfiguration.tables.CompanySettings.Text.';

const ConfigurationCompanySettings: React.FC = () => {
  const { t } = useTranslation();
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const canViewCompanySettings = usePermission('configuration:company-settings:view');
  const { search } = useLocation();
  const navConfig = useNavigationConfig();

  useEffect(() => {
    const query = new URLSearchParams(search);
    const tabKey = query.get('tabKey');
    if (tabKey) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const selectedTab: NavigationConfigItem =
        navConfig.find(tab => tab.key === tabKey) ?? navConfig[0];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      setCurrentTab(selectedTab);
    }
    if (!canViewCompanySettings) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canViewCompanySettings]);

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(navConfig[0]);

  const handleTabChange = useCallback((tab: NavigationConfigItem) => {
    setCurrentTab(tab);
  }, []);

  const Component = currentTab.component;

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.CompanySettings')} />
      <PageHeader
        title={t(`${I18N_PATH}CompanySettings`)}
        button={
          currentTab.key === 'domains' && canViewCompanySettings
            ? t(`${I18N_PATH}AddDomain`)
            : currentTab.key === 'accountingIntegration' && canViewCompanySettings
            ? t(`${I18N_PATH}AddIntegration`)
            : undefined
        }
        buttonRef={newButtonRef}
        hideSwitch
      />

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

export default ConfigurationCompanySettings;
