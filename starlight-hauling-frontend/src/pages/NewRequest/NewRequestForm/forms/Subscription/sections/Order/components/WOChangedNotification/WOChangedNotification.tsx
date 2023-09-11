import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, ValidationMessageBlock } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { INewSubscription } from '../../../../types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.ValidationMessages.WOChangedNotification';

const WOChangedNotification: React.FC = () => {
  const { values } = useFormikContext<INewSubscription>();

  const { t } = useTranslation();

  const { subscriptionStore, subscriptionDraftStore } = useStores();

  const subscription = subscriptionStore.selectedEntity ?? subscriptionDraftStore.selectedEntity;

  const isVisible = useMemo(
    () =>
      values.serviceItems.some(({ id, effectiveDate }) => {
        const originalService = subscription?.serviceItems.find(item => item.id === id);

        return effectiveDate && originalService?.effectiveDate !== effectiveDate;
      }),
    [subscription?.serviceItems, values.serviceItems],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Layouts.Margin top="2">
      <ValidationMessageBlock
        color="primary"
        shade="desaturated"
        textColor="secondary"
        borderRadius="4px"
      >
        {t(I18N_PATH)}
      </ValidationMessageBlock>
    </Layouts.Margin>
  );
};

export default observer(WOChangedNotification);
