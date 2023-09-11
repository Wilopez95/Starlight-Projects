import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

const I18N_PATH = 'Text.';

const SubscriptionOrderEditActions: React.FC = () => {
  const { subscriptionOrderStore } = useStores();
  const { t } = useTranslation();

  const handleCancel = useCallback(() => {
    subscriptionOrderStore.closeEdit();
  }, [subscriptionOrderStore]);

  return (
    <Layouts.Flex justifyContent="space-between">
      <Layouts.Flex>
        <Button onClick={handleCancel}>{t(`${I18N_PATH}Cancel`)}</Button>
      </Layouts.Flex>
      <Layouts.Flex>
        <Button type="submit">{t(`${I18N_PATH}SaveChanges`)}</Button>
      </Layouts.Flex>
    </Layouts.Flex>
  );
};

export default observer(SubscriptionOrderEditActions);
