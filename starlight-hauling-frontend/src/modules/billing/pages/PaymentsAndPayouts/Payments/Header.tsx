import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Typography } from '@root/common';
import { useBoolean, useStores } from '@root/hooks';
import { CreatePaymentModal } from '@root/modules/billing/Payments/components';

const PaymentHeader = () => {
  const { paymentStore } = useStores();

  const [isCreatePaymentModalOpen, openCreatePaymentModal, closeCreatePaymentModal] = useBoolean();

  const handleCreatePayment = useCallback(() => {
    closeCreatePaymentModal();
    paymentStore.toggleQuickView(true);
  }, [paymentStore, closeCreatePaymentModal]);

  return (
    <Layouts.Flex justifyContent="space-between">
      {!paymentStore.isOpenQuickView ? (
        <CreatePaymentModal
          isOpen={isCreatePaymentModalOpen}
          onFormSubmit={handleCreatePayment}
          onClose={closeCreatePaymentModal}
        />
      ) : null}
      <Layouts.Margin top="1" bottom="3">
        <Typography as="h1" fontWeight="bold" variant="headerTwo">
          Payments &amp; Payouts
        </Typography>
      </Layouts.Margin>
      <Protected permissions="billing/payments:payments:full-access">
        <Layouts.Margin top="1" bottom="3">
          <Button variant="primary" onClick={openCreatePaymentModal}>
            Add Payment
          </Button>
        </Layouts.Margin>
      </Protected>
    </Layouts.Flex>
  );
};

export default observer(PaymentHeader);
