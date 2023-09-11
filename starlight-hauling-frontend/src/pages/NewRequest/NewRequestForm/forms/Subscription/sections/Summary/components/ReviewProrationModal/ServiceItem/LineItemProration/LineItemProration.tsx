import React from 'react';
import { observer } from 'mobx-react-lite';

import { useLineItemName } from '@root/hooks';

import ProrationItem from '../ProrationItem/ProrationItem';

import { LineItemProrationComponent } from './types';

const LineItemProration: React.FC<LineItemProrationComponent> = ({
  billableLineItemId,
  ...props
}) => {
  const lineItemName = useLineItemName(billableLineItemId) ?? '-';

  return <ProrationItem label={lineItemName} {...props} />;
};

export default observer(LineItemProration);
