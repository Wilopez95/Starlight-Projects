import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { endOfToday, isAfter } from 'date-fns';
import { noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { SubscriptionStatusEnum } from '@root/types';

import DetailItem from '../DetailItem/DetailItem';
import OnHoldDetails from '../OnHoldDetails/OnHoldDetails';
import ReminderDetails from '../ReminderDetails';

import { ISubscriptionDetails } from './types';

const today = endOfToday();

const fallback = '-';
const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.Text.';

const SubscriptionDetails: React.FC<ISubscriptionDetails> = ({
  setReminderConfigModalOpen,
  setOnHoldModal,
}) => {
  const { subscriptionStore, subscriptionDraftStore, reminderStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const subscription = subscriptionStore.selectedEntity ?? subscriptionDraftStore.selectedEntity;
  const notDraftSubscription = subscriptionStore.selectedEntity;

  const purchaseOrder = subscription?.purchaseOrder;

  const isActiveAndExpired =
    purchaseOrder?.active &&
    purchaseOrder.expirationDate &&
    isAfter(today, purchaseOrder.expirationDate);

  return (
    <Layouts.Margin bottom="2">
      {notDraftSubscription?.status === SubscriptionStatusEnum.OnHold ? (
        <OnHoldDetails
          reason={notDraftSubscription.reason}
          reasonDescription={notDraftSubscription.reasonDescription}
          holdSubscriptionUntil={notDraftSubscription.holdSubscriptionUntil}
          setOnHoldModal={setOnHoldModal}
        />
      ) : null}
      <Typography variant="headerThree">Subscription Details</Typography>
      {subscriptionDraftStore.selectedEntity && reminderStore.currentReminderConfig ? (
        <ReminderDetails setReminderConfig={setReminderConfigModalOpen} />
      ) : null}
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Column>
          <DetailItem label="Created">
            {subscription ? (
              <Typography>
                {formatDateTime(subscription.createdAt as Date, { timeZone: localTimeZone }).time}
                <Typography as="span" color="secondary" shade="desaturated">
                  ・{formatDateTime(subscription?.createdAt as Date).date}
                </Typography>
              </Typography>
            ) : (
              fallback
            )}
          </DetailItem>
          <DetailItem label="csr" textTransform="uppercase">
            <Typography>{subscription?.csrName ?? '-'}</Typography>
          </DetailItem>
          <DetailItem label="Line of Business">
            <Typography>{subscription?.businessLine?.name ?? ''}</Typography>
          </DetailItem>
          <DetailItem label="Service Area">
            <Typography>{subscription?.serviceArea?.name ?? fallback}</Typography>
          </DetailItem>
          <DetailItem label="Price Group">{subscription?.priceGroup ?? fallback}</DetailItem>
          {purchaseOrder ? (
            <DetailItem label="PO Number">
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
            </DetailItem>
          ) : null}
        </Layouts.Column>
        <Layouts.Column>
          <DetailItem label="Subscription Contact">
            {subscription?.contactName ?? fallback}
          </DetailItem>
          <DetailItem label="Phone Number">{subscription?.contactPhone ?? fallback}</DetailItem>
          <DetailItem label="Start Date">
            {subscription?.startDate ? formatDateTime(subscription.startDate).date : fallback}
          </DetailItem>
          <DetailItem label="End Date">
            {subscription?.endDate ? formatDateTime(subscription.endDate).date : fallback}
          </DetailItem>
          <DetailItem label={t(`${I18N_PATH}MinimumAmountOfBillingPeriods`)}>
            {subscription?.minBillingPeriods ?? fallback}
          </DetailItem>
          <DetailItem label="3rd Party Hauler">
            {subscription?.thirdPartyHauler?.description ?? fallback}
          </DetailItem>
          {subscription?.permit ? (
            <DetailItem label="Permit">{subscription.permit.number}</DetailItem>
          ) : null}
          {notDraftSubscription?.status === SubscriptionStatusEnum.Active ? (
            <DetailItem label={t(`${I18N_PATH}NextServiceDate`)}>
              {formatDateTime(notDraftSubscription.nextServiceDate).date}
            </DetailItem>
          ) : null}
          <DetailItem label={t(`${I18N_PATH}NextBillingDate`)}>
            {subscription?.nextBillingPeriodTo && subscription?.nextBillingPeriodFrom
              ? `${formatDateTime(subscription.nextBillingPeriodFrom).date} - ${
                  formatDateTime(subscription.nextBillingPeriodTo).date
                }`
              : fallback}
          </DetailItem>
          {subscription?.billingType ? (
            <DetailItem label={t(`${I18N_PATH}BillingType`)}>
              {startCase(subscription.billingType)}
            </DetailItem>
          ) : null}
          {subscription?.billingCycle ? (
            <DetailItem label={t(`${I18N_PATH}BillingCycle`)}>
              {startCase(subscription.billingCycle)}
            </DetailItem>
          ) : null}
          <Layouts.Margin top="2">
            <Checkbox
              id="anniversaryBilling"
              value={subscription?.anniversaryBilling ?? false}
              name="anniversaryBilling"
              onChange={noop}
              disabled
            >
              {t(`${I18N_PATH}AnniversaryBilling`)}
            </Checkbox>
          </Layouts.Margin>
        </Layouts.Column>
      </Layouts.Flex>
      <DetailItem label="Note">
        <Typography>{subscription?.driverInstructions ?? fallback}</Typography>
      </DetailItem>
    </Layouts.Margin>
  );
};

export default observer(SubscriptionDetails);
