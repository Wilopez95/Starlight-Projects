import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { CustomerService } from '@root/api/customer/customer';
import { Shadow } from '@root/common';
import { OverrideSubscriptionLimit, SubscriptionOnHoldModal } from '@root/components/modals';
import { ClientRequestType, Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBoolean, useBusinessContext, useStores, useSubscriptionSelectedTab } from '@root/hooks';
import { type ISubscriptionOnHoldDetails } from '@root/types';

import BackButton from './components/buttons/BackButton/BackButton';
import SubscriptionActions from './components/SubscriptionActions/SubscriptionActions';
import SubscriptionHeader from './components/SubscriptionHeader/SubscriptionHeader';
import { CustomerSubscriptionParams, ICustomerSubscriptionLayout } from './types';

const I18N_PATH = 'components.PageLayouts.CustomerSubscriptionLayout.Text.';

const CustomerSubscription: React.FC<ICustomerSubscriptionLayout> = ({
  children,
  setOnHoldModal,
  setReminderConfigModalOpen,
  updateOnly,
  isOnHoldModalOpen,
  refreshSubscriptionOrders,
}) => {
  const { subscriptionStore, subscriptionDraftStore, subscriptionOrderStore } = useStores();

  const { businessUnitId } = useBusinessContext();

  const { subscriptionId, customerId } = useParams<CustomerSubscriptionParams>();
  const selectedTab = useSubscriptionSelectedTab();
  const { t } = useTranslation();
  const history = useHistory();
  const { pathname } = useLocation();
  const store =
    selectedTab === SubscriptionTabRoutes.Draft ? subscriptionDraftStore : subscriptionStore;

  const handleOpenOnHold = useCallback(() => {
    if (setOnHoldModal) {
      setOnHoldModal({ updateOnly: false, isOnHoldModalOpen: true });
    }
  }, [setOnHoldModal]);

  const handleCloseOnHold = useCallback(() => {
    if (setOnHoldModal) {
      setOnHoldModal({ updateOnly: true, isOnHoldModalOpen: false });
    }
  }, [setOnHoldModal]);

  const hasLinkButtons = [SubscriptionTabRoutes.Active, SubscriptionTabRoutes.OnHold].includes(
    selectedTab,
  );

  const hideActions = subscriptionOrderStore.editOpen || subscriptionOrderStore.isOpenQuickView;
  const [isOverrideModalOpen, showOverrideModal, hideOverrideModal] = useBoolean();

  useEffect(() => {
    store.requestById(+subscriptionId, { includeProration: true });

    return () => {
      store.unSelectEntity();
    };
  }, [store, businessUnitId, subscriptionId, selectedTab]);

  const linkToSubscriptionUrl = useCallback(
    (orderType: ClientRequestType) => {
      return pathToUrl(
        orderType === ClientRequestType.SubscriptionOrder
          ? Paths.RequestModule.SubscriptionOrder.Create
          : Paths.RequestModule.SubscriptionNonService.Create,
        {
          businessUnit: businessUnitId,
          subscriptionId,
        },
      );
    },
    [businessUnitId, subscriptionId],
  );

  const handleSubscriptionOnHold = useCallback(
    async (values: ISubscriptionOnHoldDetails) => {
      const onHold = await subscriptionStore.putOnHold(+subscriptionId, {
        ...values,
        updateOnly,
      });

      subscriptionStore.requestCount({ businessUnitId });

      if (updateOnly) {
        await subscriptionStore.requestById(+subscriptionId);
      } else {
        onHold &&
          history.replace(
            pathname.replace(SubscriptionTabRoutes.Active, SubscriptionTabRoutes.OnHold),
          );
      }
      if (refreshSubscriptionOrders) {
        subscriptionOrderStore.cleanup();
      }

      handleCloseOnHold();
    },
    [
      subscriptionStore,
      history,
      pathname,
      handleCloseOnHold,
      subscriptionId,
      updateOnly,
      refreshSubscriptionOrders,
      subscriptionOrderStore,
      businessUnitId,
    ],
  );

  const handleOnResume = useCallback(async () => {
    hideOverrideModal();
    const isResumed = await subscriptionStore.resume(+subscriptionId);

    subscriptionStore.requestCount({ businessUnitId });

    isResumed &&
      history.replace(pathname.replace(SubscriptionTabRoutes.OnHold, SubscriptionTabRoutes.Active));

    if (refreshSubscriptionOrders) {
      subscriptionOrderStore.cleanup();
    }
  }, [
    subscriptionStore,
    subscriptionId,
    history,
    pathname,
    hideOverrideModal,
    refreshSubscriptionOrders,
    subscriptionOrderStore,
    businessUnitId,
  ]);

  const handleResume = useCallback(async () => {
    const { customerBalances } = await CustomerService.getBalances(+customerId);

    if (customerBalances.availableCredit <= 0) {
      showOverrideModal();
    } else {
      handleOnResume();
    }
  }, [customerId, showOverrideModal, handleOnResume]);

  return (
    <Shadow as={Layouts.Box} variant="light" width="100%">
      <SubscriptionOnHoldModal
        isOpen={!!isOnHoldModalOpen}
        onClose={handleCloseOnHold}
        onFormSubmit={handleSubscriptionOnHold}
        updateOnly={!!updateOnly}
      />
      <OverrideSubscriptionLimit
        isOpen={isOverrideModalOpen}
        subTitle={t(`${I18N_PATH}TotalAmountExceedsCreditLimit`)}
        onCancel={hideOverrideModal}
        onSubmit={handleOnResume}
      />
      <Layouts.Flex
        as={Layouts.Box}
        direction="column"
        backgroundColor="white"
        overflowHidden
        height="100%"
      >
        <Layouts.Padding padding="3" bottom="0">
          <BackButton />
          <SubscriptionHeader>
            {hasLinkButtons ? (
              <>
                <Button to={linkToSubscriptionUrl(ClientRequestType.SubscriptionNonService)}>
                  {t(`${I18N_PATH}LinkSubscriptionNonServiceOrder`)}
                </Button>
                <Layouts.Box width="10px" />
                <Button to={linkToSubscriptionUrl(ClientRequestType.SubscriptionOrder)}>
                  {t(`${I18N_PATH}LinkSubscriptionOrder`)}
                </Button>
              </>
            ) : null}
          </SubscriptionHeader>
        </Layouts.Padding>
        {children}
        {!hideActions ? (
          <SubscriptionActions
            subscription={store.selectedEntity}
            handleOpenOnHold={handleOpenOnHold}
            handleResume={handleResume}
            handleReminderConfigModalOpen={setReminderConfigModalOpen}
          />
        ) : null}
      </Layouts.Flex>
    </Shadow>
  );
};

export default observer(CustomerSubscription);
