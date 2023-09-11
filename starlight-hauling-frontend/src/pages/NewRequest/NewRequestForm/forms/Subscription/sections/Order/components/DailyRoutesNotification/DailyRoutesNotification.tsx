import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, ValidationMessageBlock } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { INewSubscription } from '../../../../types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.ValidationMessages.DailyRoutesNotification';

const DailyRoutesNotification: React.FC = () => {
  const { values } = useFormikContext<INewSubscription>();

  const { subscriptionStore, subscriptionDraftStore } = useStores();

  const { t } = useTranslation();

  const subscription = subscriptionStore.selectedEntity ?? subscriptionDraftStore.selectedEntity;

  const isVisible = useMemo(
    () =>
      values.serviceItems.some(({ id, serviceDaysOfWeek }) => {
        const originalService = subscription?.serviceItems.find(item => item.id === id);

        return (
          originalService?.serviceDaysOfWeek &&
          !isEqual(
            Object.values(originalService.serviceDaysOfWeek).map(({ route }) => route as number),
            Object.values(serviceDaysOfWeek).map(({ route }) => route),
          )
        );
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

export default observer(DailyRoutesNotification);
