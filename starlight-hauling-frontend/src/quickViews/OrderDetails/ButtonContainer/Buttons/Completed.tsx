import React, { useCallback } from 'react';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { useStores } from '@root/hooks';

import { IButtons } from './types';

const Completed: React.FC<IButtons> = ({ onSubmit, shouldRemoveOrderFromStore }) => {
  const { orderStore } = useStores();

  const handleComplete = useCallback(() => {
    onSubmit(async values => {
      await orderStore.approve({
        order: values,
        shouldDeleteFromStore: shouldRemoveOrderFromStore,
      });
    });
  }, [onSubmit, orderStore, shouldRemoveOrderFromStore]);

  return (
    <Protected permissions="orders:approve:perform">
      <Button variant="primary" onClick={handleComplete}>
        Approve Order
      </Button>
    </Protected>
  );
};

export default observer(Completed);
