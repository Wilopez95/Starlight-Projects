import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Typography } from '@root/common';
import { useBoolean, useStores } from '@root/hooks';
import { CreatePaymentModal } from '@root/modules/billing/Payments/components';

const PayoutHeader = () => {
  const { payoutStore } = useStores();
  const [isCreatePaymentModalOpen, openCreatePaymentModal, closeCreatePaymentModal] = useBoolean();

  const handleCreatePayout = useCallback(() => {
    closeCreatePaymentModal();
    payoutStore.toggleQuickView(true);
  }, [payoutStore, closeCreatePaymentModal]);

  return (
    <Layouts.Flex justifyContent="space-between">
      <CreatePaymentModal
        isOpen={isCreatePaymentModalOpen}
        onFormSubmit={handleCreatePayout}
        onClose={closeCreatePaymentModal}
        isPayout
      />
      <Layouts.Margin top="1" bottom="3">
        <Typography as="h1" fontWeight="bold" variant="headerTwo">
          Payments &amp; Payouts
        </Typography>
      </Layouts.Margin>
      <Protected permissions="billing/payments:payout:perform">
        <Layouts.Margin top="1" bottom="3">
          <Button variant="primary" onClick={openCreatePaymentModal}>
            Add Payout
          </Button>
        </Layouts.Margin>
      </Protected>
    </Layouts.Flex>
  );
};

export default observer(PayoutHeader);
