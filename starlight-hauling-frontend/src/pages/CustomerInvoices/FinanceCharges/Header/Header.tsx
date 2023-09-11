import React, { useCallback, useMemo } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { Typography } from '@root/common';
import { FinanceChargeService } from '@root/modules/billing/FinanceCharges/api/financeCharge';
import { SendFinanceChargesModal } from '@root/modules/billing/FinanceCharges/components';
import { useBoolean, useStores } from '@hooks';

import { CustomerStyles } from '../../../Customer';

const FinanceChargesHeader: React.FC = () => {
  const { financeChargeStore } = useStores();
  const [isSendFinanceChargesModalOpen, openSendFinanceChargesModal, closeSendFinanceChargesModal] =
    useBoolean();

  const checkedLength = financeChargeStore.checkedFinanceCharges.length;

  const handleSendFinanceCharges = useCallback(
    ({ emails }: { emails: string[] }) => {
      const ids = financeChargeStore.checkedFinanceCharges.map(statement => statement.id);

      financeChargeStore.sendFinanceCharges({
        ids,
        emails: emails.filter(email => validator.isEmail(email)),
      });
      closeSendFinanceChargesModal();
    },
    [closeSendFinanceChargesModal, financeChargeStore],
  );

  const selectedFinanceChargesIds = useMemo(() => {
    return financeChargeStore.checkedFinanceCharges.map(({ id }) => `ids=${id}`).join('&');
  }, [financeChargeStore.checkedFinanceCharges]);

  const handleFinChargesDownload = useCallback(() => {
    FinanceChargeService.downloadFinanceCharges(selectedFinanceChargesIds);
  }, [selectedFinanceChargesIds]);

  return (
    <>
      <SendFinanceChargesModal
        isOpen={isSendFinanceChargesModalOpen}
        onClose={closeSendFinanceChargesModal}
        onFormSubmit={handleSendFinanceCharges}
      />
      <CustomerStyles.TitleContainer>
        {checkedLength === 0 ? (
          <Typography fontWeight="bold" variant="headerTwo">
            Finance Charges
          </Typography>
        ) : (
          <>
            <Typography variant="headerTwo">{checkedLength} Finance charge(s) selected</Typography>
            <Layouts.Flex alignItems="center">
              <Layouts.Flex>
                <Layouts.Margin left="2">
                  <Button onClick={handleFinChargesDownload}>Download</Button>
                </Layouts.Margin>
                <Layouts.Margin left="2">
                  <Button onClick={openSendFinanceChargesModal} variant="primary">
                    Send to Emails
                  </Button>
                </Layouts.Margin>
              </Layouts.Flex>
            </Layouts.Flex>
          </>
        )}
      </CustomerStyles.TitleContainer>
    </>
  );
};

export default observer(FinanceChargesHeader);
