import React, { useCallback, useEffect, useState } from 'react';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { QuickViewContent } from '@root/common/QuickView';

import { useBoolean, useStores } from '../../../../../hooks';
import SendFinanceChargesModal from '../SendFinanceCharges/SendFinanceCharges';

import LeftPanel from './LeftPanel/LeftPanel';
import { tabConfigs } from './config';
import { getCurrentTable } from './helpers';
import { FinanceChargeQuickViewTabs } from './types';

const FinanceChargeQuickView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationConfigItem<FinanceChargeQuickViewTabs>>(
    tabConfigs[0],
  );
  const { financeChargeStore } = useStores();

  const [isSendFinanceChargesModalOpen, openSendFinanceChargesModal, closeSendFinanceChargesModal] =
    useBoolean();

  const currentFinCharge = financeChargeStore.selectedEntity;

  const finChargeId = currentFinCharge?.id;

  const handleSendFinanceCharges = useCallback(
    async ({ emails }: { emails: string[] }) => {
      if (finChargeId) {
        closeSendFinanceChargesModal();
        await financeChargeStore.sendFinanceCharges({ ids: [finChargeId], emails });
        financeChargeStore.requestDetailed(finChargeId);
      }
    },
    [closeSendFinanceChargesModal, finChargeId, financeChargeStore],
  );

  useEffect(() => {
    if (finChargeId) {
      financeChargeStore.requestDetailed(finChargeId);
    }
  }, [finChargeId, financeChargeStore]);

  const CurrentTable = getCurrentTable(activeTab.key) as React.FC<{}>;

  return (
    <>
      <SendFinanceChargesModal
        isOpen={isSendFinanceChargesModalOpen}
        onClose={closeSendFinanceChargesModal}
        onFormSubmit={handleSendFinanceCharges}
      />
      <QuickViewContent
        leftPanelElement={<LeftPanel />}
        rightPanelElement={
          <Layouts.Scroll rounded>
            <Layouts.Padding top="3">
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
        actionsElement={
          <Layouts.Flex justifyContent="flex-end">
            {currentFinCharge?.pdfUrl ? (
              <>
                <Layouts.Margin left="2">
                  <a
                    download
                    href={currentFinCharge.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>Download</Button>
                  </a>
                </Layouts.Margin>
                <Layouts.Margin left="2">
                  <Button variant="primary" onClick={openSendFinanceChargesModal}>
                    Send to Email
                  </Button>
                </Layouts.Margin>
              </>
            ) : null}
          </Layouts.Flex>
        }
      />
    </>
  );
};

export default observer(FinanceChargeQuickView);
