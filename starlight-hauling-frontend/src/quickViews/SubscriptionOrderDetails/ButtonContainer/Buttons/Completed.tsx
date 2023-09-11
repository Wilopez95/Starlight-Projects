import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { useStores } from '@root/hooks';

import { IButtons } from './types';

const I18N_PATH = 'quickViews.SubscriptionOrderDetails.ButtonContainer.Buttons.Completed.Text.';

const Completed: React.FC<IButtons> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();

  const handleComplete = useCallback(() => {
    onSubmit(data => {
      return subscriptionOrderStore.approve(data);
    });
  }, [onSubmit, subscriptionOrderStore]);

  return (
    <Protected permissions="orders:approve:perform">
      <Button variant="primary" onClick={handleComplete}>
        {t(`${I18N_PATH}ApproveOrder`)}
      </Button>
    </Protected>
  );
};

export default observer(Completed);
