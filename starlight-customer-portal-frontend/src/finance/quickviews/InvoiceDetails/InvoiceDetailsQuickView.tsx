import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Divider, TableQuickView, withQuickView } from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { InvoiceType } from '@root/finance/types/entities';

import LeftPanel from './LeftPanel/LeftPanel';
import { useTabConfigs } from './config';
import { getCurrentTable } from './helpers';
import * as QuickViewStyles from './styles';
import { IInvoiceTableQuickView, InvoiceQuickViewTabs } from './types';

const I18N_PATH = 'Text.';

const InvoiceDetailsQuickView: React.FC<IInvoiceTableQuickView> = ({ tabContainer }) => {
  const { invoiceStore } = useStores();
  const { t } = useTranslation();

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

  const CurrentTable = useMemo(() => {
    return getCurrentTable(activeTab.key);
  }, [activeTab.key]);

  if (!currentInvoice) {
    return null;
  }

  return (
    <>
      <TableQuickView
        parentRef={tabContainer}
        clickOutContainers={tabContainer}
        store={invoiceStore}
        size='three-quarters'
      >
        {({ onCancel, onAddRef, scrollContainerHeight }) => (
          <QuickViewStyles.Wrapper>
            <QuickViewStyles.CrossIcon onClick={onCancel} />
            <QuickViewStyles.Container>
              <LeftPanel />
              <Layouts.Scroll height={scrollContainerHeight}>
                <Layouts.Padding padding='3'>
                  <QuickViewStyles.RightPanel>
                    <Navigation
                      configs={tabConfigs}
                      onChange={setActiveTab}
                      activeTab={activeTab}
                      withEmpty
                      border
                    />
                    <CurrentTable />
                  </QuickViewStyles.RightPanel>
                </Layouts.Padding>
              </Layouts.Scroll>
            </QuickViewStyles.Container>
            <QuickViewStyles.ButtonContainer ref={onAddRef}>
              <Divider bottom />
              <Layouts.Flex justifyContent='flex-end'>
                {currentInvoice.pdfUrl && (
                  <Layouts.Margin left='2'>
                    <a
                      download
                      href={currentInvoice.pdfUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Button variant='primary'>{t(`${I18N_PATH}Download`)}</Button>
                    </a>
                  </Layouts.Margin>
                )}
              </Layouts.Flex>
            </QuickViewStyles.ButtonContainer>
          </QuickViewStyles.Wrapper>
        )}
      </TableQuickView>
    </>
  );
};

export default withQuickView(observer(InvoiceDetailsQuickView));
