import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { JobSiteSection, OrderSection, PaymentSection } from './sections';
import { IOrderEditRightPanel } from './types';

const RightPanel: React.FC<IOrderEditRightPanel> = ({ onRateRequest }) => (
  <Layouts.Scroll rounded>
    <Layouts.Padding padding="3">
      <JobSiteSection />
      <OrderSection onRateRequest={onRateRequest} />
      <PaymentSection />
    </Layouts.Padding>
  </Layouts.Scroll>
);

export default observer(RightPanel);
