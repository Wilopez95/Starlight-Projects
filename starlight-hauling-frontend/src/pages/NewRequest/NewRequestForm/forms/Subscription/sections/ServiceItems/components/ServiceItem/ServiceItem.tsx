import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useFormikContext } from 'formik';
import { pick } from 'lodash-es';

import { Section } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { Routes } from '@root/consts';
import { generateServicePropPath } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/helpers';
import {
  INewServiceItemSubscriptionOrders,
  INewSubscription,
  INewSubscriptionFormParams,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { useStores } from '@hooks';

import {
  useServiceItemEnd,
  useSubscriptionOrdersOrganizer,
  useSubscriptionOrdersWithServiceItemSynchronizer,
} from './hooks';
import { IServiceItem } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.ServiceItems.components.ServiceItem.Text.';

export const ServiceItem: React.FC<IServiceItem> = ({ serviceIndex, children }) => {
  const { entity: entityParam } = useParams<INewSubscriptionFormParams>();
  const { t } = useTranslation();
  const { billableServiceStore } = useStores();
  const { values, initialValues, setFieldValue } = useFormikContext<INewSubscription>();

  const isSubscriptionDraftEdit = entityParam === Routes.SubscriptionDraft;
  const serviceItem = values.serviceItems[serviceIndex];
  const initialServiceItem = initialValues.serviceItems[serviceIndex];

  const updateServiceItemSubscriptionOrders = useCallback(
    (serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders) => {
      setFieldValue(
        generateServicePropPath({
          serviceIndex,
          property: 'subscriptionOrders',
        }),
        serviceItemSubscriptionOrders.subscriptionOrders,
      );

      setFieldValue(
        generateServicePropPath({
          serviceIndex,
          property: 'optionalSubscriptionOrders',
        }),
        serviceItemSubscriptionOrders.optionalSubscriptionOrders,
      );
    },
    [serviceIndex, setFieldValue],
  );

  const updateServiceItemQuantity = useCallback(
    (newQuantity: number) => {
      setFieldValue(
        generateServicePropPath({
          serviceIndex,
          property: 'quantity',
        }),
        newQuantity,
      );
    },
    [serviceIndex, setFieldValue],
  );

  useSubscriptionOrdersOrganizer({
    serviceItemSubscriptionOrders: pick(serviceItem, [
      'subscriptionOrders',
      'optionalSubscriptionOrders',
    ]),
    updateServiceItemSubscriptionOrders,
  });

  useSubscriptionOrdersWithServiceItemSynchronizer({
    isSubscriptionDraftEdit,
    serviceItem,
    initialServiceItem,
    billableServices: billableServiceStore.sortedValues,
    updateServiceItemSubscriptionOrders,
    subscriptionEndDate: values.endDate,
  });

  const serviceItemEnd = useServiceItemEnd({
    serviceItem,
    updateServiceItemQuantity,
  });

  /*
  TODO: move service item related code step by step from ServiceItems.tsx into this component
   and then get rid of "children" prop
   https://starlightpro.atlassian.net/browse/HAULING-8011
  */

  return (
    <Section>
      <ConfirmModal
        title={t(`${I18N_PATH}RemoveService`)}
        subTitle={t(`${I18N_PATH}DoYouWantToContinue`)}
        cancelButton={t('Text.Cancel')}
        onCancel={serviceItemEnd.closeModal}
        isOpen={serviceItemEnd.isModalOpen}
        submitButton={t('Text.Confirm')}
        onSubmit={serviceItemEnd.confirm}
      />
      {children({ handleEndService: serviceItemEnd.endService })}
    </Section>
  );
};
