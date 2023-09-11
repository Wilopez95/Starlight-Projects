import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import * as QuickViewStyles from '../styles';

import SubscriptionOrderHeader from './components/sections/SubscriptionOrderHeader/SubscriptionOrderHeader';
import SubscriptionOrderViewActions from './components/sections/SubscriptionOrderViewActions/SubscriptionOrderViewActions';
import SubscriptionOrderContent from './components/SubscriptionOrderContent/SubscriptionOrderContent';
import { ICustomerSubscriptionOrderQuickView } from './types';

const CustomerSubscriptionOrderQuickView: React.FC<ICustomerSubscriptionOrderQuickView> = ({
  tableContainerRef,
  closeOnClick,
}) => {
  const { subscriptionOrderStore, subscriptionStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscription = subscriptionStore.selectedEntity;

  if (!(subscription && subscriptionOrder)) {
    return null;
  }

  return (
    <TableQuickView
      parentRef={tableContainerRef}
      store={subscriptionOrderStore}
      size="full"
      closeOnClickOut={closeOnClick}
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => (
        <>
          <div ref={onAddRef} className={tableQuickViewStyles.header}>
            <QuickViewStyles.CrossIcon onClick={() => onCancel()} />
            <SubscriptionOrderHeader />
          </div>
          <Divider top />
          <Layouts.Scroll maxHeight={scrollContainerHeight}>
            <SubscriptionOrderContent tableContainerRef={tableContainerRef} />
          </Layouts.Scroll>
          <Divider />
          <Layouts.Padding padding="2" bottom="5" ref={onAddRef}>
            <SubscriptionOrderViewActions />
          </Layouts.Padding>
        </>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(CustomerSubscriptionOrderQuickView));
