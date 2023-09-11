import React, { useEffect, useMemo, useState } from 'react';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { QuickViewContent } from '../../../../../common';
import { useStores } from '../../../../../hooks';
import { InvoiceType } from '../../types';

import LeftPanel from './LeftPanel/LeftPanel';
import { useTabConfigs } from './config';
import { getCurrentTable } from './helpers';
import { InvoiceQuickViewActions } from './InvoiceQuickViewActions';
import { InvoiceQuickViewTabs } from './types';

const InvoiceQuickViewContent: React.FC = () => {
  const { invoiceStore } = useStores();

  const currentInvoice = invoiceStore.selectedEntity!;

  const tabConfigs = useTabConfigs(currentInvoice.type);
  const [activeTab, setActiveTab] = useState<NavigationConfigItem<InvoiceQuickViewTabs>>(
    tabConfigs[0],
  );

  const invoiceId = currentInvoice?.id;

  useEffect(() => {
    if (invoiceId) {
      invoiceStore.requestDetailed(invoiceId);
    }
  }, [invoiceId, invoiceStore]);

  useEffect(() => {
    const shouldBeActiveSubscriptionTab =
      activeTab.key === InvoiceQuickViewTabs.Orders &&
      currentInvoice.type === InvoiceType.subscriptions;
    const shouldBeActiveOrderTab =
      activeTab.key === InvoiceQuickViewTabs.Subscriptions &&
      currentInvoice.type === InvoiceType.orders;

    if (shouldBeActiveSubscriptionTab || shouldBeActiveOrderTab) {
      setActiveTab(tabConfigs[0]);
    }
  }, [activeTab.key, currentInvoice.type, tabConfigs]);

  const CurrentTable = useMemo(() => getCurrentTable(activeTab.key), [activeTab.key]) as React.FC;

  return (
    <QuickViewContent
      leftPanelElement={<LeftPanel />}
      actionsElement={
        <InvoiceQuickViewActions id={currentInvoice.id} pdfUrl={currentInvoice.pdfUrl} />
      }
      rightPanelElement={
        <Layouts.Scroll>
          <Layouts.Padding padding="3">
            <Navigation
              configs={tabConfigs}
              onChange={setActiveTab}
              activeTab={activeTab}
              withEmpty
              border
            />
            <CurrentTable />
          </Layouts.Padding>
        </Layouts.Scroll>
      }
    />
  );
};

export default observer(InvoiceQuickViewContent);
