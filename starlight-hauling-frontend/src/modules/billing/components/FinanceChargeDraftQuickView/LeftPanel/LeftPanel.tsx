import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { sumBy } from 'lodash-es';

import { useIntl } from '@root/i18n/useIntl';

import { ArrowLeftIcon } from '../../../../../assets';
import { Typography, useQuickViewContext } from '../../../../../common';
import { LeftPanelTools } from '../../../../../common/QuickView';

import { mapCustomerToNavItem } from './helpers';
import { ILeftPanel } from './types';

const I18N_PATH = 'quickViews.FinanceChargeDraftQuickView.LeftPanel.';
const LeftPanel: React.FC<ILeftPanel> = ({
  customers,
  currentCustomerIndex,
  onNavigationChange,
}) => {
  const { closeQuickView } = useQuickViewContext();
  const customerNavigationConfigs = customers.map(mapCustomerToNavItem);
  const { t } = useTranslation();

  const { formatCurrency } = useIntl();

  const handleNavigationChange = useCallback(
    (tab: NavigationConfigItem) => {
      onNavigationChange(tab.index);
    },
    [onNavigationChange],
  );

  const totalInvoices = sumBy(customers, x => x.invoices.length);
  const totalCharges = sumBy(customers, c => sumBy(c.invoices, i => i.fine ?? 0));

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography color="information" onClick={closeQuickView} cursor="pointer">
              <Layouts.Flex alignItems="center">
                <Layouts.IconLayout color="information" shade="dark">
                  <ArrowLeftIcon />
                </Layouts.IconLayout>
                {t(`${I18N_PATH}Back`)}
              </Layouts.Flex>
            </Typography>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography variant="headerThree">{t(`${I18N_PATH}FinanceChargesPreview`)}</Typography>
          </LeftPanelTools.Item>
        </LeftPanelTools.ItemsContainer>
        {currentCustomerIndex !== null ? (
          <Layouts.Box>
            <Layouts.Margin top="2" bottom="2" left="2">
              <Typography color="secondary" shade="desaturated" variant="headerFive">
                {t(`${I18N_PATH}Customers`)}
              </Typography>
            </Layouts.Margin>
            <Navigation
              activeTab={customerNavigationConfigs[currentCustomerIndex]}
              configs={customerNavigationConfigs}
              onChange={handleNavigationChange}
              direction="column"
            />
          </Layouts.Box>
        ) : null}
      </Layouts.Scroll>

      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}Customers`)}:
          </Typography>
          <Typography variant="bodyLarge">{customers.length}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}OverdueInvoices`)}
          </Typography>
          <Typography variant="bodyLarge">{totalInvoices}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated" variant="headerFive">
            {t(`${I18N_PATH}FinanceChargesTotal`)}:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(totalCharges)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default LeftPanel;
