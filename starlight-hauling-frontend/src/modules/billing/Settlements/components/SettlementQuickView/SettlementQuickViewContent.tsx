import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, NavigationConfigItem } from '@starlightpro/shared-components';
import { sumBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { ConfirmModal } from '@root/components/modals';
import { PaymentService } from '@root/modules/billing/Payments/api/payment';
import { type ManuallyCreatablePayment } from '@root/modules/billing/Payments/types';

import { QuickViewContent, Typography } from '../../../../../common';
import { TableTools } from '../../../../../common/TableTools';
import { useStores, useToggle } from '../../../../../hooks';
import { SettlementService } from '../../api/settlement';

import LeftPanel from './LeftPanel/LeftPanel';
import SettledTransactions from './SettledTransactions/SettledTransactions';
import UnconfirmedPayments from './UnconfirmedPayments/UnconfirmedPayments';
import { mapPayment } from './helpers';
import { useNavigation } from './hooks';
import { SettlementTabKey } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'modules.billing.Settlements.components.SettlementQuickView.Text.';

const SettlementQuickViewContent: React.FC = () => {
  const { settlementStore } = useStores();
  const { t } = useTranslation();
  const [unconfirmedPayments, setUnconfirmedPayments] = useState<ManuallyCreatablePayment[]>([]);
  const [isConfirmModalOpen, toggleConfirmModal] = useToggle(false);

  const currentSettlement = settlementStore.selectedEntity;

  const tabs = useNavigation();

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<SettlementTabKey>>(tabs[0]);

  const isOnSettledTab = currentTab.key === 'settled';

  useEffect(() => {
    (async () => {
      if (currentSettlement) {
        const response = await PaymentService.getUnconfirmed({
          settlementId: currentSettlement.id,
        });

        setUnconfirmedPayments(response.unconfirmedPayments.map(mapPayment));
      }
    })();
  }, [currentSettlement]);

  const handleSettlementDelete = useCallback(async () => {
    if (currentSettlement) {
      await settlementStore.deleteSettlements([currentSettlement.id]);
      settlementStore.unSelectEntity();
      toggleConfirmModal();
    }
  }, [settlementStore, currentSettlement, toggleConfirmModal]);

  const handleSettlementDownload = useCallback(() => {
    if (currentSettlement) {
      SettlementService.downloadSettlements(`settlementIds=${currentSettlement.id}`);
    }
  }, [currentSettlement]);

  const unconfirmedCount = unconfirmedPayments.length;
  const unconfirmedTotal = sumBy(unconfirmedPayments, 'amount');

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t(`${I18N_PATH}DeleteButton`)}
        title={t(`${I18N_PATH}DeleteSettlementsHeader`)}
        subTitle={t(`${I18N_PATH}DeleteSettlementsBody`)}
        onCancel={toggleConfirmModal}
        className={styles.modal}
        onSubmit={handleSettlementDelete}
      />
      <QuickViewContent
        leftPanelElement={
          <LeftPanel unconfirmedTotal={unconfirmedTotal} unconfirmedCount={unconfirmedCount} />
        }
        rightPanelElement={
          <>
            <Layouts.Padding top="3" left="2" bottom="3">
              <Typography variant="headerFour">{t(`${I18N_PATH}Records`)}</Typography>
            </Layouts.Padding>

            <TableTools.ScrollContainer
              tableNavigation={
                <TableTools.HeaderNavigation
                  tabs={tabs}
                  selectedTab={currentTab}
                  onChangeTab={(item: NavigationConfigItem<SettlementTabKey>) =>
                    setCurrentTab(item)
                  }
                />
              }
            >
              {isOnSettledTab ? (
                <SettledTransactions />
              ) : (
                <UnconfirmedPayments payments={unconfirmedPayments} />
              )}
            </TableTools.ScrollContainer>
          </>
        }
        actionsElement={
          <Layouts.Flex justifyContent="space-between">
            <Button variant="converseAlert" onClick={toggleConfirmModal}>
              {t('Text.Delete')}
            </Button>
            <Button onClick={handleSettlementDownload}>{t('Text.Download')}</Button>
          </Layouts.Flex>
        }
      />
    </>
  );
};

export default observer(SettlementQuickViewContent);
