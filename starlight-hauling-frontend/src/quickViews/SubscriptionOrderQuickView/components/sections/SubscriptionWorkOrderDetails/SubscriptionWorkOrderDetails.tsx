/* eslint-disable no-negated-condition */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { endOfToday, isAfter } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { BusinessLineType } from '@root/consts';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { DetailItem } from '@root/pages/CustomerSubscriptionDetails/components';
import { SubscriptionWorkOrderStatusEnum } from '@root/types';

const today = endOfToday();

const fallback = '-';
const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionWorkOrderDetails.Text.';

const SubscriptionWorkOrderDetails: React.FC<{ oneTime: boolean }> = ({ oneTime }) => {
  const { subscriptionStore, subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;
  const purchaseOrder = subscriptionWorkOrder?.purchaseOrder;
  const isActiveAndExpired =
    purchaseOrder?.active &&
    purchaseOrder.expirationDate &&
    isAfter(today, purchaseOrder.expirationDate);

  if (!subscription) {
    return null;
  }
  const businessLineType = subscription.businessLine.type;

  return (
    <Layouts.Margin bottom="2">
      <Typography variant="headerThree">
        {t(`${I18N_PATH}Subscription`)}
        {!oneTime ? ` ${t(`${I18N_PATH}Servicing`)}` : ''} {t(`${I18N_PATH}WorkOrderDetails`)}
      </Typography>
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Column>
          <DetailItem label={t(`${I18N_PATH}Created`)}>
            <Typography>
              {formatDateTime(subscription.createdAt as Date, { timeZone: localTimeZone }).time}
              <Typography as="span" color="secondary" shade="desaturated">
                ・{formatDateTime(subscription.createdAt as Date).date}
              </Typography>
            </Typography>
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}csr`)} textTransform="uppercase">
            <Typography>{subscription.csrName}</Typography>
          </DetailItem>

          <DetailItem label={t(`${I18N_PATH}Driver'sName`)}>
            <Typography>{subscriptionWorkOrder?.driverName ?? fallback}</Typography>
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}PONumber`)}>
            {purchaseOrder ? (
              <>
                <Typography>
                  <Layouts.Margin as="span" right="1">
                    {purchaseOrder.poNumber}
                  </Layouts.Margin>
                </Typography>
                {isActiveAndExpired ? (
                  <Badge color="primary" borderRadius={2}>
                    {t('Text.Expired')}
                  </Badge>
                ) : null}
                {!purchaseOrder.active ? (
                  <Badge color="alert" borderRadius={2}>
                    {t('Text.Inactive')}
                  </Badge>
                ) : null}
              </>
            ) : (
              fallback
            )}
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}PreferredRoute`)}>
            <Typography>{subscriptionWorkOrder?.assignedRoute ?? fallback}</Typography>
          </DetailItem>
        </Layouts.Column>
        <Layouts.Column>
          <DetailItem label={t(`${I18N_PATH}ServiceDate`)}>
            {subscriptionWorkOrder?.serviceDate
              ? formatDateTime(subscriptionWorkOrder.serviceDate).date
              : fallback}
          </DetailItem>
          {businessLineType === BusinessLineType.portableToilets ? (
            <DetailItem label={t(`${I18N_PATH}Permit`)}>
              {subscriptionOrder?.permit?.number ?? fallback}
            </DetailItem>
          ) : null}
          <DetailItem label={`${t('Text.DroppedEquipment')} #`}>
            {subscriptionWorkOrder?.droppedEquipmentItem ?? fallback}
          </DetailItem>
          <DetailItem label={`${t('Text.PickedUpEquipment')} #`}>
            {subscriptionWorkOrder?.pickedUpEquipmentItem ?? fallback}
          </DetailItem>
          {subscriptionWorkOrder?.status === SubscriptionWorkOrderStatusEnum.blocked ? (
            <DetailItem label={t(`${I18N_PATH}BlockingReason`)} color="alert" shade="light">
              <Typography>{subscriptionWorkOrder?.blockingReason ?? fallback}</Typography>
            </DetailItem>
          ) : null}
        </Layouts.Column>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(SubscriptionWorkOrderDetails);
