import React from 'react';
import { observer } from 'mobx-react-lite';

import ProrationItem from '../ProrationItem/ProrationItem';

import { IServiceProrationItemComponent } from './types';

const fallback = '-';

const ServiceProrationItem: React.FC<IServiceProrationItemComponent> = ({
  billableService,
  ...props
}) => {
  return (
    <ProrationItem
      name={billableService?.description ?? fallback}
      prorationType={billableService?.prorationType}
      {...props}
    />
  );
};

export default observer(ServiceProrationItem);
