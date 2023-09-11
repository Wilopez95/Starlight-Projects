import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Tooltip, Typography } from '@root/common';
import { ClientRequestType, CustomerStatus } from '@root/consts';
import { usePermission, useStores } from '@root/hooks';

import { configs } from './config';
import OrderTypeButton from './OrderTypeButton';
import * as Styles from './styles';
import { IOrderTypeSelect } from './types';

const I18N_PATH = 'components.OrderTypeSelect.Text.';

const OrderTypeSelect: React.FC<IOrderTypeSelect> = ({ businessLineType, onOrderTypeSelect }) => {
  const { customerStore } = useStores();
  const canCreateSubscription = usePermission('subscriptions:place-new:perform');
  const canCreateForOnHoldSubscription = usePermission('subscriptions:create-for-on-hold:perform');

  const canPlaceOnHoldOrders = usePermission('orders:new-on-account-on-hold-order:perform');
  const selectedCustomer = customerStore.selectedEntity;

  const { t } = useTranslation();

  const filteredConfigs = useMemo(() => {
    const hideCreateSubscription =
      !canCreateSubscription ||
      (!canCreateForOnHoldSubscription && selectedCustomer?.status === CustomerStatus.onHold);

    const hideLinkOrder =
      !canPlaceOnHoldOrders && selectedCustomer?.status === CustomerStatus.onHold;

    return configs[businessLineType]
      .filter(
        config =>
          !(config.type === ClientRequestType.Subscription && hideCreateSubscription) &&
          !(!selectedCustomer?.onAccount && config.type === ClientRequestType.RecurrentOrder) &&
          !(config.type === ClientRequestType.SubscriptionOrder && hideLinkOrder),
      )
      .map(config => ({
        ...config,
        disabled:
          (!selectedCustomer?.onAccount &&
            [ClientRequestType.Subscription, ClientRequestType.SubscriptionOrder].includes(
              config.type,
            )) ||
          config.disabled,
      }));
  }, [
    businessLineType,
    selectedCustomer?.onAccount,
    canCreateSubscription,
    canPlaceOnHoldOrders,
    canCreateForOnHoldSubscription,
    selectedCustomer?.status,
  ]);

  return (
    <>
      <Layouts.Margin bottom="3">
        <Typography
          variant="caption"
          color="secondary"
          shade="light"
          fontWeight="semiBold"
          textTransform="uppercase"
        >
          {t(`${I18N_PATH}SelectServiceType`)}
        </Typography>
      </Layouts.Margin>
      <Layouts.Flex as={Layouts.Box} height="16rem" $wrap>
        {filteredConfigs.map((order, index) =>
          order.disabled ? (
            <Styles.Disabled width="50%" height="54px" key={index}>
              <Tooltip position="top" text={t(`${I18N_PATH}DisabledMessage`)}>
                <OrderTypeButton {...order} onClick={onOrderTypeSelect} />
              </Tooltip>
            </Styles.Disabled>
          ) : (
            <Styles.Hovered width="50%" height="54px" key={index}>
              <OrderTypeButton {...order} onClick={onOrderTypeSelect} />
            </Styles.Hovered>
          ),
        )}
      </Layouts.Flex>
    </>
  );
};

export default OrderTypeSelect;
