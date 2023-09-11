import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Section, Subsection } from '@root/common';

import JobSite from '../JobSite/JobSite';
import LineItems from '../LineItems/LineItems';
import OrderDetails from '../OrderDetails/OrderDetails';
import RecurringLineItems from '../RecurringLineItems/RecurringLineItems';
import Service from '../Service/Service';

const RightPanel = () => (
  <Layouts.Scroll>
    <Layouts.Padding top="2">
      <JobSite />
      <OrderDetails />
      <Section>
        <Service />
        <RecurringLineItems />
        <Subsection gray>
          <LineItems />
        </Subsection>
      </Section>
    </Layouts.Padding>
  </Layouts.Scroll>
);

export default observer(RightPanel);
