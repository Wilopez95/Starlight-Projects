import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { CustomerStatus, Paths, Routes, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import {
  useBusinessContext,
  useCrudPermissions,
  usePermission,
  useStores,
  useSubscriptionSelectedTab,
  useUserContext,
} from '@root/hooks';
import { CustomerActions } from '@root/pages/Customer';
import { getFinalSubscriptionOrdersQuantity } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/helpers';

import { CustomerSubscriptionParams } from '../../types';

import { ISubscriptionActions } from './types';

const I18N_PATH =
  'components.PageLayouts.CustomerSubscriptionLayout.components.SubscriptionActions.Text.';

const SubscriptionActions: React.FC<ISubscriptionActions> = ({
  subscription,
  handleOpenOnHold,
  handleResume,
  handleReminderConfigModalOpen,
}) => {
  const { subscriptionId } = useParams<CustomerSubscriptionParams>();
  const selectedTab = useSubscriptionSelectedTab();
  const { businessUnitId } = useBusinessContext();
  const { currentUser } = useUserContext();
  const { billableServiceStore, reminderStore, customerStore } = useStores();
  const canCreateSubscription = usePermission('subscriptions:place-new:perform');
  const [canViewSubscriptionsList] = useCrudPermissions('subscriptions', 'all');
  const [canViewMySubscriptionsList] = useCrudPermissions('subscriptions', 'own');
  const isCSR = currentUser?.email === subscription?.csrEmail;
  const isSalesRep = currentUser?.id === subscription?.customer.salesId;
  const customer = customerStore.selectedEntity;
  const { t } = useTranslation();

  useEffect(() => {
    if (billableServiceStore.sortedValues.length === 0 && subscription?.businessLine) {
      billableServiceStore.request({
        businessLineId: subscription.businessLine.id,
        activeOnly: true,
      });
    }
  }, [subscription, billableServiceStore]);

  const isNotCompetedSubscription = useMemo(
    () =>
      subscription?.serviceItems.some(service => {
        const finalSubscriptionOrdersQuantity = getFinalSubscriptionOrdersQuantity(
          service.subscriptionOrders,
          billableServiceStore.sortedValues,
        );

        return service.quantity != finalSubscriptionOrdersQuantity;
      }),
    [billableServiceStore.sortedValues, subscription?.serviceItems],
  );

  return (
    <CustomerActions>
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex>
          {selectedTab === SubscriptionTabRoutes.Active &&
          (canViewSubscriptionsList || canViewMySubscriptionsList) ? (
            <Protected permissions="subscriptions:put-on-hold:perform">
              <Button onClick={handleOpenOnHold}>{t(`${I18N_PATH}HoldSubscription`)}</Button>
            </Protected>
          ) : null}
          {selectedTab === SubscriptionTabRoutes.OnHold &&
          (canViewSubscriptionsList || canViewMySubscriptionsList) ? (
            <Protected permissions="subscriptions:put-on-hold:perform">
              <Button onClick={handleResume} disabled={customer?.status === CustomerStatus.onHold}>
                {t(`${I18N_PATH}ResumeSubscription`)}
              </Button>
            </Protected>
          ) : null}
        </Layouts.Flex>
        <Layouts.Flex>
          {canViewSubscriptionsList || canViewMySubscriptionsList ? (
            <Protected permissions="subscriptions:clone:perform">
              <Button
                to={pathToUrl(Paths.RequestModule.Subscription.Clone, {
                  businessUnit: businessUnitId,
                  subscriptionId,
                  entity:
                    selectedTab === SubscriptionTabRoutes.Draft
                      ? Routes.SubscriptionDraft
                      : Routes.Subscription,
                })}
              >
                {t(`${I18N_PATH}CloneSubscription`)}
              </Button>
            </Protected>
          ) : null}
          {selectedTab !== SubscriptionTabRoutes.Closed || isNotCompetedSubscription ? (
            <>
              {selectedTab == SubscriptionTabRoutes.Draft &&
              canCreateSubscription &&
              (isCSR || isSalesRep) &&
              !reminderStore.currentReminderConfig ? (
                <Layouts.Margin left="2">
                  <Button onClick={handleReminderConfigModalOpen}>
                    {t(`${I18N_PATH}SetReminder`)}
                  </Button>
                </Layouts.Margin>
              ) : null}
              <Layouts.Margin left="2">
                <Button
                  variant="primary"
                  to={pathToUrl(Paths.RequestModule.Subscription.Edit, {
                    businessUnit: businessUnitId,
                    subscriptionId,
                    entity:
                      selectedTab === SubscriptionTabRoutes.Draft
                        ? Routes.SubscriptionDraft
                        : Routes.Subscription,
                  })}
                >
                  {t(`${I18N_PATH}EditSubscription`)}
                </Button>
              </Layouts.Margin>
            </>
          ) : null}
        </Layouts.Flex>
      </Layouts.Flex>
    </CustomerActions>
  );
};

export default observer(SubscriptionActions);
