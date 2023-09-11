import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { useStores } from '@root/hooks';

import { IButtons } from './types';

const I18N_PATH = 'quickViews.SubscriptionOrderDetails.ButtonContainer.Buttons.Approved.Text.';

const Approved: React.FC<IButtons> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();

  const handleFinalize = useCallback(() => {
    onSubmit(data => {
      return subscriptionOrderStore.finalize(data);
    });
  }, [onSubmit, subscriptionOrderStore]);

  return (
    <Protected permissions="orders:finalize:perform">
      <Button variant="primary" onClick={handleFinalize}>
        {t(`${I18N_PATH}FinalizeOrder`)}
      </Button>
    </Protected>
  );
};

export default observer(Approved);
