import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { useStores } from '@root/hooks';

import CancelOrder from './CancelOrder';
import { IButtons } from './types';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionOrderViewActions.Buttons.InProgress.';

const InProgress: React.FC<IButtons> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();

  const handleComplete = useCallback(() => {
    onSubmit(subscriptionOrderId => {
      return subscriptionOrderStore.openCompletionDetails(subscriptionOrderId, false);
    });
  }, [onSubmit, subscriptionOrderStore]);

  return (
    <>
      <CancelOrder />
      <Protected permissions="orders:complete:perform">
        <Layouts.Margin left="3">
          <Button variant="primary" onClick={handleComplete}>
            {t(`${I18N_PATH}CompleteOrder`)}
          </Button>
        </Layouts.Margin>
      </Protected>
    </>
  );
};

export default observer(InProgress);
