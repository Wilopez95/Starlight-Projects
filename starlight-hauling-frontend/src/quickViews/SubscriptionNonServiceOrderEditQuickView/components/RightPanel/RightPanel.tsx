import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import JobSite from '../JobSite/JobSite';
import OrderDetails from '../OrderDetails/OrderDetails';

const RightPanel: React.FC = () => {
  return (
    <Layouts.Scroll>
      <Layouts.Padding top="2">
        <JobSite />
        <OrderDetails />
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(RightPanel);
