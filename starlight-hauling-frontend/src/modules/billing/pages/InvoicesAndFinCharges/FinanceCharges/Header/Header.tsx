import React, { useCallback, useMemo } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { FinanceChargeService } from '@root/modules/billing/FinanceCharges/api/financeCharge';
import { SendFinanceChargesModal } from '@root/modules/billing/FinanceCharges/components';

import { Typography } from '../../../../../../common';
import { useBoolean, useStores } from '../../../../../../hooks';

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
    <Layouts.Margin bottom="2">
      <SendFinanceChargesModal
        isOpen={isSendFinanceChargesModalOpen}
        onClose={closeSendFinanceChargesModal}
        onFormSubmit={handleSendFinanceCharges}
      />
      <Layouts.Box minHeight="50px" position="relative">
        <Layouts.Flex alignItems="center" justifyContent="space-between">
          <Layouts.Flex alignItems="center" justifyContent="flex-start">
            {checkedLength === 0 ? (
              <Layouts.Margin right="3">
                <Typography as="h1" variant="headerTwo">
                  Finance Charges
                </Typography>
              </Layouts.Margin>
            ) : (
              <Typography as="h1" variant="headerTwo">
                {checkedLength} Finance charge(s) selected
              </Typography>
            )}
          </Layouts.Flex>
          <Layouts.Flex alignItems="center" justifyContent="flex-end">
            {checkedLength > 0 ? (
              <Layouts.Flex>
                <Layouts.Margin left="3">
                  <Button onClick={handleFinChargesDownload}>Download</Button>
                </Layouts.Margin>
                <Layouts.Margin left="3">
                  <Button onClick={openSendFinanceChargesModal} variant="primary">
                    Send to Emails
                  </Button>
                </Layouts.Margin>
              </Layouts.Flex>
            ) : null}
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Box>
    </Layouts.Margin>
  );
};

export default observer(FinanceChargesHeader);
