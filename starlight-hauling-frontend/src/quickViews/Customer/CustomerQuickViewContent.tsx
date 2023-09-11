import React from 'react';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { QuickViewContent } from '@root/common/QuickView';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import CustomerQuickViewRightPanel from './CustomerQuickViewRightPanel';

const CustomerQuickViewContent: React.FC = () => {
  const { customerStore } = useStores();

  const { businessUnitId } = useBusinessContext();
  const customer = customerStore.selectedEntity;

  if (!customer) {
    return null;
  }

  const customerDetailsLink = pathToUrl(Paths.CustomerModule.Profile, {
    businessUnit: businessUnitId,
    customerId: customer.id,
  });

  return (
    <QuickViewContent
      rightPanelElement={<CustomerQuickViewRightPanel customerDetailsLink={customerDetailsLink} />}
      actionsElement={
        <Button to={customerDetailsLink} variant="primary" full>
          Go to Profile Details →
        </Button>
      }
    />
  );
};

export default observer(CustomerQuickViewContent);
