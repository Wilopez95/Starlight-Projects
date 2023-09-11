import React, { useRef, useState } from 'react';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  CustomerSubscriptionLayout,
  CustomerSubscriptionNavigation,
} from '@root/components/PageLayouts';
import InvoicesHeader from '@root/modules/billing/pages/InvoicesAndFinCharges/Invoices/Header/Header';
import Invoices from '@root/modules/billing/pages/InvoicesAndFinCharges/Invoices/Invoices';

const CustomerInvoicesDetails = () => {
  const subscriptionNavigationRef = useRef<HTMLDivElement>(null);

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
    >
      <CustomerSubscriptionNavigation ref={subscriptionNavigationRef} />
      <InvoicesHeader onInvoicesGenerated={noop} />
      <Invoices isSpecificDetails />
    </CustomerSubscriptionLayout>
  );
};

export default observer(CustomerInvoicesDetails);
