import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Typography } from '@root/common';
import { useStores } from '@root/hooks';
import { CustomerStyles } from '@root/pages/Customer';

const PaymentHeader: React.FC = () => {
  const { paymentStore } = useStores();

  const handleCreatePayment = useCallback(() => {
    paymentStore.toggleQuickView(true);
  }, [paymentStore]);

  return (
    <CustomerStyles.TitleContainer>
      <Typography fontWeight="bold" variant="headerTwo">
        Payments &amp; Statements
      </Typography>

      <Layouts.Flex>
        <Protected permissions="billing:write-offs:full-access">
          <Layouts.Margin right="2">
            <Button onClick={paymentStore.openWriteOffQuickView}>Write off</Button>
          </Layouts.Margin>
        </Protected>
        <Protected permissions="billing/payments:credit-memo:perform">
          <Layouts.Margin right="2">
            <Button onClick={paymentStore.openCreateMemoQuickView}>Add Credit Memo</Button>
          </Layouts.Margin>
        </Protected>
        <Protected permissions="billing/payments:payments:full-access">
          <Button variant="primary" onClick={handleCreatePayment}>
            Add Payment
          </Button>
        </Protected>
      </Layouts.Flex>
    </CustomerStyles.TitleContainer>
  );
};

export default observer(PaymentHeader);
