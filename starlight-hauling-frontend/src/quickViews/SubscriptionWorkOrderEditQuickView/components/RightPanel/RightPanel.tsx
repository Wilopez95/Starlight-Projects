import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Section } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import JobSite from '../JobSite/JobSite';
import LineItems from '../LineItems/LineItems';
import OrderDetails from '../OrderDetails/OrderDetails';
import RecurringLineItems from '../RecurringLineItems/RecurringLineItems';
import Service from '../Service/Service';

const RightPanel = () => {
  const { subscriptionOrderStore } = useStores();
  const oneTime = subscriptionOrderStore.selectedEntity?.oneTime;

  return (
    <Layouts.Scroll>
      <Layouts.Padding top="2">
        <JobSite />
        <OrderDetails />
        <Section>
          <Service />
          <Divider />
          {!oneTime ? (
            <>
              <RecurringLineItems />
              <Divider />
            </>
          ) : null}
          <LineItems />
        </Section>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(RightPanel);
