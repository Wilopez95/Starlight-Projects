import React from 'react';
import { observer } from 'mobx-react-lite';

import ProrationItem from '../ProrationItem/ProrationItem';

import { ILineItemProration } from './types';

const fallback = '-';

const LineItemProration: React.FC<ILineItemProration> = ({ billableLineItems, ...props }) => {
  return <ProrationItem name={billableLineItems?.description ?? fallback} {...props} />;
};

export default observer(LineItemProration);
