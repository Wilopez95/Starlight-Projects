import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import DetailColumnItem from '../DetailColumnItem/DetailColumnItem';
import TotalBlock from '../TotalBlock/TotalBlock';

import { ILineItemsComponent } from './types';

const LineItems: React.FC<ILineItemsComponent> = ({ lineItems: [firstItem, ...lineItems] }) => {
  return (
    <>
      <Layouts.Flex justifyContent="space-between">
        <DetailColumnItem label="Recurring Line Item" width="38rem" textTransform="uppercase">
          {firstItem.billableLineItem?.description}
        </DetailColumnItem>
        <TotalBlock price={firstItem.price} quantity={firstItem.quantity} />
      </Layouts.Flex>
      {lineItems.map(({ id, price, quantity, billableLineItem }) => (
        <Layouts.Flex justifyContent="space-between" key={id}>
          <DetailColumnItem width="38rem" textTransform="uppercase">
            {billableLineItem?.description}
          </DetailColumnItem>
          <TotalBlock price={price} quantity={quantity} hideLabels />
        </Layouts.Flex>
      ))}
    </>
  );
};

export default observer(LineItems);
