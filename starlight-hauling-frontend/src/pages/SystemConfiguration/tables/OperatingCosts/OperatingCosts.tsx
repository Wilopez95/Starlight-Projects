import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { type NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TablePageContainer, TableTools } from '@root/common/TableTools';
import { OperatingCostTabs } from '@root/consts';
import { useCrudPermissions } from '@root/hooks';

import { PageHeader } from '../../components';
import { type ISystemConfigurationTable } from '../../types';

import TrucksAndDriversHeader from './tables/TrucksAndDrivers/Header';
import { navigationConfig } from './navigationConfig';
import { DisposalRatesTable, ThirdPartyHaulerRatesTable, TrucksAndDriversTable } from './tables';

const I18N_PATH = 'pages.SystemConfiguration.tables.OperatingCosts.Text.';

const OperatingCosts: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const navigationRef = useRef<HTMLDivElement>(null);
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const [_, __, canCreateOperatingCosts] = useCrudPermissions('configuration', 'operating-costs');

  const [currentTab, setCurrentTab] = useState(navigationConfig[0]);

  const { t } = useTranslation();

  const handleChangeTab = (newTab: NavigationConfigItem) => {
    setCurrentTab(newTab);
  };

  const navigationComponent = (
    <TableTools.HeaderNavigation
      navigationRef={navigationRef}
      selectedTab={currentTab}
      tabs={navigationConfig}
      onChangeTab={handleChangeTab}
    />
  );

  let component: React.ReactElement | null = null;

  switch (currentTab.key) {
    case OperatingCostTabs.TrucksAndDrivers:
      component = (
        <>
          <TrucksAndDriversHeader
            buttonRef={newButtonRef}
            canCreateOperatingCosts={canCreateOperatingCosts}
          />
          <TableTools.ScrollContainer tableNavigation={navigationComponent}>
            <TrucksAndDriversTable />
          </TableTools.ScrollContainer>
        </>
      );
      break;
    case OperatingCostTabs.DisposalRates:
      component = (
        <>
          <PageHeader title={t(`${I18N_PATH}OperatingCosts`)} />
          <TableTools.ScrollContainer tableNavigation={navigationComponent}>
            <DisposalRatesTable />
          </TableTools.ScrollContainer>
        </>
      );
      break;
    case OperatingCostTabs.ThirdPartyHaulerRates:
      component = (
        <>
          <PageHeader hideSwitch title={t(`${I18N_PATH}OperatingCosts`)} />
          <TableTools.ScrollContainer tableNavigation={navigationComponent}>
            <ThirdPartyHaulerRatesTable />
          </TableTools.ScrollContainer>
        </>
      );
      break;
    default: {
      component = (
        <>
          <TrucksAndDriversHeader
            buttonRef={newButtonRef}
            canCreateOperatingCosts={canCreateOperatingCosts}
          />
          <TableTools.ScrollContainer tableNavigation={navigationComponent}>
            <TrucksAndDriversTable />
          </TableTools.ScrollContainer>
        </>
      );
    }
  }

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.OperatingCosts')} />
      {component}
    </TablePageContainer>
  );
};

export default observer(OperatingCosts);
