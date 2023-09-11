/* eslint-disable complexity */ // disabled because it will need a huge refactor
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { endOfToday, isAfter } from 'date-fns';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { useRatesGroup } from '@root/components/PriceGroupSelect/hooks';
import { BusinessLineType } from '@root/consts';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { DetailItem } from '@root/pages/CustomerSubscriptionDetails/components';
import { SubscriptionOrderStatusEnum } from '@root/types';

const today = endOfToday();

const fallback = '-';
const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionOrderDetails.Text.';

const SubscriptionOrderDetails: React.FC<{ oneTime: boolean; isNonServiceOrder: boolean }> = ({
  oneTime,
  isNonServiceOrder,
}) => {
  const { t } = useTranslation();
  const { subscriptionStore, subscriptionOrderStore } = useStores();
  const { formatDateTime } = useIntl();
  const ratesGroup = useRatesGroup();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const businessLineType = subscription?.businessLine.type;
  const firstName = subscriptionOrder?.subscriptionContact?.firstName ?? '';
  const lastName = subscriptionOrder?.subscriptionContact?.lastName ?? '';
  const name = subscriptionOrder?.customer?.name ?? '';
  const purchaseOrder = subscriptionOrder?.purchaseOrder;
  const isActiveAndExpired =
    purchaseOrder?.active &&
    purchaseOrder.expirationDate &&
    isAfter(today, purchaseOrder.expirationDate);

  const priceGroup = useMemo(() => {
    if (oneTime && ratesGroup?.level === 'custom') {
      const customRatesGroup = ratesGroup.customRatesGroups.find(
        item =>
          item.id === subscriptionOrder?.customRatesGroupServicesId ||
          item.id === subscriptionOrder?.customRatesGroup?.originalId,
      );

      if (customRatesGroup) {
        return customRatesGroup.description;
      }
    }
    if (!oneTime) {
      return subscriptionOrder?.customRatesGroup?.description;
    }

    return t(`${I18N_PATH}GeneralPriceGroup`);
  }, [
    oneTime,
    ratesGroup,
    subscriptionOrder?.customRatesGroupServicesId,
    subscriptionOrder?.customRatesGroup,
    t,
  ]);

  return (
    <Layouts.Margin bottom="2">
      <Typography variant="headerThree">
        {t(`${I18N_PATH}Subscription`)} {!oneTime ? t(`${I18N_PATH}Servicing`) : null}{' '}
        {t(`${I18N_PATH}OrderDetails`)}
      </Typography>
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Column>
          <DetailItem label={t(`${I18N_PATH}Created`)}>
            {subscriptionOrder ? (
              <Typography>
                {
                  formatDateTime(subscriptionOrder.createdAt as Date, { timeZone: localTimeZone })
                    .time
                }
                <Typography as="span" color="secondary" shade="desaturated">
                  . {formatDateTime(subscriptionOrder.createdAt as Date).date}
                </Typography>
              </Typography>
            ) : (
              fallback
            )}
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}csr`)} textTransform="uppercase">
            <Typography>{subscription?.csrName}</Typography>
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}LineOfBusiness`)}>
            <Typography>{subscription?.businessLine.name}</Typography>
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}CustomerName`)}>
            <Typography>{`${name}`}</Typography>
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}ServiceArea`)}>
            <Typography>{subscription?.serviceArea?.name ?? fallback}</Typography>
          </DetailItem>
          <DetailItem label={`${t(`${I18N_PATH}PriceGroup`)}`}>{priceGroup}</DetailItem>
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
          {!isNonServiceOrder ? (
            <DetailItem label={t(`${I18N_PATH}PreferredRoute`)}>
              <Typography>{subscriptionOrder?.assignedRoutes?.join(', ') ?? fallback}</Typography>
            </DetailItem>
          ) : null}
        </Layouts.Column>
        <Layouts.Column>
          {oneTime && !isNonServiceOrder ? (
            <>
              <DetailItem label={t(`${I18N_PATH}CallOnWay`)}>
                {subscriptionOrder?.callOnWayPhoneNumber ??
                  subscription?.callOnWayPhoneNumber ??
                  fallback}
              </DetailItem>
              <DetailItem label={t(`${I18N_PATH}TextOnWay`)}>
                {subscriptionOrder?.textOnWayPhoneNumber ??
                  subscription?.textOnWayPhoneNumber ??
                  fallback}
              </DetailItem>
            </>
          ) : null}
          {!isNonServiceOrder ? (
            <>
              <DetailItem label={t(`${I18N_PATH}SubscriptionOrderContact`)}>
                {firstName} {lastName}
              </DetailItem>
              <DetailItem label={t(`${I18N_PATH}PhoneNumber`)}>
                {subscription?.contactPhone ?? fallback}
              </DetailItem>
            </>
          ) : null}
          <DetailItem label={t(`${I18N_PATH}ServiceDate`)}>
            {subscriptionOrder?.serviceDate
              ? formatDateTime(subscriptionOrder.serviceDate).date
              : fallback}
          </DetailItem>
          {!oneTime && !isNonServiceOrder ? (
            <DetailItem label={t(`${I18N_PATH}BillingCycle`)}>
              {startCase(subscription?.customer.billingCycle) ?? fallback}
            </DetailItem>
          ) : null}
          <DetailItem label={t(`${I18N_PATH}3rdPartyHauler`)}>
            {subscriptionOrder?.thirdPartyHaulerDescription ?? fallback}
          </DetailItem>
          {businessLineType === BusinessLineType.portableToilets && !isNonServiceOrder ? (
            <DetailItem label={t(`${I18N_PATH}Permit`)}>
              {subscriptionOrder?.permit?.number ?? fallback}
            </DetailItem>
          ) : null}
          {oneTime && !isNonServiceOrder ? (
            <>
              <DetailItem label={`${t('Text.DroppedEquipment')} #`}>
                {subscriptionOrder?.droppedEquipmentItems?.join(', ') ?? fallback}
              </DetailItem>
              <DetailItem label={`${t('Text.PickedUpEquipment')} #`}>
                {subscriptionOrder?.pickedUpEquipmentItems?.join(', ') ?? fallback}
              </DetailItem>
            </>
          ) : null}
          {subscriptionOrder?.cancellationReason ? (
            <DetailItem label={t(`${I18N_PATH}CancellationReason`)} color="alert" shade="standard">
              {t(`consts.OrderCancellationReason.${subscriptionOrder.cancellationReason}`)}
            </DetailItem>
          ) : null}
          {subscriptionOrder?.cancellationComment ? (
            <DetailItem label={t(`${I18N_PATH}CancellationComment`)} color="alert" shade="standard">
              {subscriptionOrder.cancellationComment}
            </DetailItem>
          ) : null}
          {(subscriptionOrder?.status === SubscriptionOrderStatusEnum.inProgress ||
            subscriptionOrder?.status === SubscriptionOrderStatusEnum.scheduled) &&
          subscriptionOrder?.uncompletedComment ? (
            <DetailItem label={t(`Text.UncompletedComment`)} color="alert" shade="dark">
              <Typography>{subscriptionOrder?.uncompletedComment ?? fallback}</Typography>
            </DetailItem>
          ) : null}
          {subscriptionOrder?.status === SubscriptionOrderStatusEnum.completed &&
          subscriptionOrder?.unapprovedComment ? (
            <DetailItem label={t(`Text.UnapprovedComment`)} color="alert" shade="dark">
              <Typography>{subscriptionOrder?.unapprovedComment ?? fallback}</Typography>
            </DetailItem>
          ) : null}
          {subscriptionOrder?.status === SubscriptionOrderStatusEnum.approved &&
          subscriptionOrder?.unfinalizedComment ? (
            <DetailItem label={t(`Text.UnfinalizedComment`)} color="alert" shade="dark">
              <Typography>{subscriptionOrder?.unfinalizedComment ?? fallback}</Typography>
            </DetailItem>
          ) : null}
        </Layouts.Column>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(SubscriptionOrderDetails);
