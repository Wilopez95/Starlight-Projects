import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { CustomerSubscriptionOrdersTable } from '@root/components';
import { CustomerSubscriptionLayout } from '@root/components/PageLayouts';

const CustomerSubscriptionOrders: React.FC = () => {
  const [{ updateOnly, isOnHoldModalOpen }, setOnHoldModal] = useState<{
    updateOnly: boolean;
    isOnHoldModalOpen: boolean;
  }>({
    updateOnly: false,
    isOnHoldModalOpen: false,
  });

  return (
    <CustomerSubscriptionLayout
      updateOnly={updateOnly}
      isOnHoldModalOpen={isOnHoldModalOpen}
      setOnHoldModal={setOnHoldModal}
      refreshSubscriptionOrders
    >
      <CustomerSubscriptionOrdersTable />
    </CustomerSubscriptionLayout>
  );
};

export default observer(CustomerSubscriptionOrders);
