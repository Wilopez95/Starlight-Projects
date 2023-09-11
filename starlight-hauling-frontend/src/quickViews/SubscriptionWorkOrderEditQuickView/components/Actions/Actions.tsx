import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

const I18N_PATH = 'Text.';

const SubscriptionOrderEditActions: React.FC = () => {
  const { subscriptionWorkOrderStore } = useStores();
  const { t } = useTranslation();

  const handleCancel = useCallback(() => {
    subscriptionWorkOrderStore.closeWorkOrderEdit();
  }, [subscriptionWorkOrderStore]);

  return (
    <Layouts.Padding padding="2">
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex>
          <Button onClick={handleCancel}>{t(`${I18N_PATH}Cancel`)}</Button>
        </Layouts.Flex>
        <Layouts.Flex>
          <Button type="submit">{t(`${I18N_PATH}SaveChanges`)}</Button>
        </Layouts.Flex>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(SubscriptionOrderEditActions);
