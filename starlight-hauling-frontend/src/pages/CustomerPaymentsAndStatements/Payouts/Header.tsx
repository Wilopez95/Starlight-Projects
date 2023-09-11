import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Typography } from '@root/common';
import { useStores } from '@root/hooks';
import { CustomerStyles } from '@root/pages/Customer';

const PayoutHeader: React.FC = () => {
  const { payoutStore } = useStores();

  const handleCreatePayout = useCallback(() => {
    payoutStore.toggleQuickView(true);
  }, [payoutStore]);

  return (
    <CustomerStyles.TitleContainer>
      <Typography fontWeight="bold" variant="headerTwo">
        Payments &amp; Statements
      </Typography>

      <Protected permissions="billing/payments:payout:perform">
        <Layouts.Flex>
          <Button variant="primary" onClick={handleCreatePayout}>
            Add Payout
          </Button>
        </Layouts.Flex>
      </Protected>
    </CustomerStyles.TitleContainer>
  );
};

export default observer(PayoutHeader);
