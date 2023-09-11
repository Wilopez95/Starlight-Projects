import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { getCurrentContainer } from './components';

const ButtonContainer: React.FC = () => {
  const { orderStore } = useStores();

  const order = orderStore.selectedEntity;

  if (!order) {
    return null;
  }

  const Component = getCurrentContainer(order.status);

  return Component && <Component order={order} />;
};

export default observer(ButtonContainer);
