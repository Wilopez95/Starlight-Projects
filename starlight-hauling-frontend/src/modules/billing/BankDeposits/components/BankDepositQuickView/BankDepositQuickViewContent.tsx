import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { QuickViewContent, useQuickViewContext } from '@root/common/QuickView';

import { Protected, Typography } from '../../../../../common';
import { ConfirmModal } from '../../../../../components/modals';
import { useBusinessContext, useStores, useToggle } from '../../../../../hooks';
import * as QuickViewStyles from '../../../../../quickViews/styles';
import { BankDepositService } from '../../api/bankDeposit';
import { BankDepositStatus, BankDepositType } from '../../types';

import LeftPanel from './LeftPanel/LeftPanel';
import { PaymentRecords } from './Records/PaymentRecords';

const I18N_PATH = 'modules.billing.BankDeposits.components.BankDepositQuickView.Text.';

const BankDepositQuickViewContent: React.FC = () => {
  const { bankDepositStore } = useStores();
  const [isConfirmModalOpen, toggleConfirmModal] = useToggle();
  const { businessUnitId } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const { closeQuickView } = useQuickViewContext();
  const { t } = useTranslation();

  const currentBankDeposit = bankDepositStore.selectedEntity!;

  const bankDepositId = currentBankDeposit.id;

  useEffect(() => {
    bankDepositStore.requestDetailed(bankDepositId);
  }, [bankDepositId, bankDepositStore]);

  const handleBankDepositDelete = useCallback(async () => {
    await bankDepositStore.deleteBankDeposit(bankDepositId);

    closeQuickView();
  }, [bankDepositId, bankDepositStore, closeQuickView]);

  const handleUnlock = useCallback(async () => {
    setLoading(true);

    await bankDepositStore.unlockBankDeposit(currentBankDeposit, businessUnitId);

    setLoading(false);

    closeQuickView();
  }, [bankDepositStore, businessUnitId, closeQuickView, currentBankDeposit]);

  const handleLock = useCallback(async () => {
    setLoading(true);

    await bankDepositStore.lockBankDeposit({
      businessUnitId,
      id: bankDepositId,
      date: currentBankDeposit.date,
      isCreate: false,
    });

    setLoading(false);

    closeQuickView();
  }, [bankDepositId, bankDepositStore, businessUnitId, closeQuickView, currentBankDeposit.date]);

  const handleDownloadBankDeposit = useCallback(() => {
    const bankDepositQueryParams = new URLSearchParams({ ids: bankDepositId.toString() });

    BankDepositService.downloadBankDeposit(bankDepositQueryParams.toString());
  }, [bankDepositId]);

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t('Text.Delete')}
        title={t(`${I18N_PATH}DeleteBankDeposit`)}
        subTitle={t(`${I18N_PATH}AreYouSure`)}
        onCancel={toggleConfirmModal}
        onSubmit={handleBankDepositDelete}
      />

      <QuickViewContent
        leftPanelElement={<LeftPanel />}
        rightPanelElement={
          <Layouts.Scroll>
            <Layouts.Padding padding="3" top="5" bottom="0">
              <Typography variant="headerFour">{t(`${I18N_PATH}Records`)}</Typography>
            </Layouts.Padding>
            <QuickViewStyles.RightPanel>
              <PaymentRecords payments={currentBankDeposit.payments} />
            </QuickViewStyles.RightPanel>
          </Layouts.Scroll>
        }
        actionsElement={
          <Layouts.Flex
            justifyContent={
              currentBankDeposit.status === BankDepositStatus.unLocked ||
              currentBankDeposit.payments?.length ||
              bankDepositStore.loading
                ? 'flex-end'
                : 'space-between'
            }
          >
            {currentBankDeposit.status === BankDepositStatus.unLocked ||
              (currentBankDeposit.payments?.length === 0 && !bankDepositStore.loading && (
                <Button variant="converseAlert" onClick={toggleConfirmModal}>
                  {t('Text.Delete')}
                </Button>
              ))}
            <Layouts.Flex>
              <Button onClick={handleDownloadBankDeposit}>{t('Text.Download')}</Button>

              {currentBankDeposit.depositType === BankDepositType.cashCheck &&
              !currentBankDeposit.synced ? (
                <Protected permissions="billing:lock-bank-deposits:perform">
                  <Layouts.Margin left="2">
                    <Button
                      variant="alert"
                      disabled={loading}
                      onClick={
                        currentBankDeposit.status === BankDepositStatus.locked
                          ? handleUnlock
                          : handleLock
                      }
                    >
                      {t(
                        currentBankDeposit.status === BankDepositStatus.locked
                          ? 'Text.Unlock'
                          : 'Text.Lock',
                      )}{' '}
                      {t(`${I18N_PATH}BankDeposit`)}
                    </Button>
                  </Layouts.Margin>
                </Protected>
              ) : null}
            </Layouts.Flex>
          </Layouts.Flex>
        }
      />
    </>
  );
};

export default observer(BankDepositQuickViewContent);
