import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { Divider, Table, TableQuickView, withQuickView } from '@root/common/TableTools';
import { Paths, Routes, SubscriptionTabRoutes, subscriptionTabStatus } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import {
  useBusinessContext,
  useCrudPermissions,
  useStores,
  useSubscriptionSelectedTab,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { getFinalSubscriptionOrdersQuantity } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/helpers';

import * as QuickViewStyles from '../styles';

import ServiceItem from './ServiceItem/ServiceItem';
import { ISubscriptionQuickView } from './types';

const fallback = '-';
const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.Text.';

const SubscriptionQuickView: React.FC<ISubscriptionQuickView> = ({
  mine,
  tableScrollContainerRef,
  tbodyContainerRef,
}) => {
  const selectedTab = useSubscriptionSelectedTab();
  const { subscriptionStore, billableServiceStore } = useStores();
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useIntl();
  const { businessUnitId } = useBusinessContext();
  const [, canModifyAllSubscriptions, hasFullAccessAllSubscriptions] = useCrudPermissions(
    'subscriptions',
    'all',
  );
  const [, canModifyOwnSubscriptions, hasFullAccessOwnSubscriptions] = useCrudPermissions(
    'subscriptions',
    'own',
  );
  const canModify = mine ? canModifyOwnSubscriptions : canModifyAllSubscriptions;
  const hasFullAccessSubscriptions = mine
    ? hasFullAccessOwnSubscriptions
    : hasFullAccessAllSubscriptions;
  // eslint-disable-next-line
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const subscription = subscriptionStore.selectedEntity;

  useEffect(() => {
    if (billableServiceStore.sortedValues.length === 0 && subscription?.businessLine) {
      billableServiceStore.request({
        businessLineId: subscription.businessLine.id,
        activeOnly: true,
      });
    }
  }, [subscription, billableServiceStore]);

  useEffect(() => {
    if (subscriptionStore.selectedEntity?.id) {
      subscriptionStore.requestById(subscriptionStore.selectedEntity.id);
    }
  }, [subscriptionStore, subscriptionStore.selectedEntity?.id]);

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

  const handleCancel = useCallback(() => subscriptionStore.unSelectEntity(), [subscriptionStore]);

  if (!subscription) {
    return null;
  }

  const detailsUrl = pathToUrl(Paths.CustomerSubscriptionModule.Details, {
    businessUnit: businessUnitId,
    subscriptionId: subscription.id,
    customerId: subscription.customer?.originalId,
    tab: subscriptionTabStatus.get(subscription.status),
  });

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      clickOutContainers={tbodyContainerRef}
      store={subscriptionStore}
      onCancel={handleCancel}
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => (
        <>
          <div ref={onAddRef} className={tableQuickViewStyles.header}>
            <QuickViewStyles.CrossIcon onClick={() => onCancel()} />

            <div className={tableQuickViewStyles.dataContainer}>
              <div className={tableQuickViewStyles.quickViewTitle}>
                {t(`${I18N_PATH}Subscription`)} #
                <Link to={detailsUrl}>
                  <Typography as="span" color="information">
                    {subscription.id}
                  </Typography>
                </Link>
              </div>

              <div className={tableQuickViewStyles.quickViewDescription}>
                <Badge borderRadius={2} color={subscription.colorByStatus}>
                  {startCase(subscription.status)}
                </Badge>
              </div>
            </div>
          </div>
          <Divider top />
          <Layouts.Scroll height={scrollContainerHeight}>
            <Layouts.Padding padding="3">
              <Table className={tableQuickViewStyles.table}>
                <tbody>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}LineOfBusiness`)}
                    </Typography>
                    <Typography as="td">{subscription.businessLine?.name}</Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}ServiceArea`)}
                    </Typography>
                    <Typography as="td">{subscription.serviceArea?.name ?? fallback}</Typography>
                  </tr>
                  <Divider colSpan={2} />
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}Created`)}
                    </Typography>
                    <td>
                      <Typography as="span">
                        {
                          formatDateTime(subscription.createdAt as Date, {
                            timeZone: localTimeZone,
                          }).time
                        }
                      </Typography>
                      <Typography as="span" color="secondary" shade="desaturated">
                        {formatDateTime(subscription.createdAt as Date).date}
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}CSR`)}
                    </Typography>
                    <Typography as="td">{subscription.csrName}</Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}Customer`)}
                    </Typography>
                    <Typography as="td">{subscription.customerName}</Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}JobSite`)}
                    </Typography>
                    <Typography as="td">{subscription.jobSiteAddress}</Typography>
                  </tr>

                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}TaxDistrict`)}
                    </Typography>
                    <Typography as="td">
                      {subscription.taxDistricts
                        ?.map(({ districtName }) => districtName ?? fallback)
                        .join(', ')}
                    </Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}StartDate`)}
                    </Typography>
                    <Typography as="td">
                      {subscription.startDate
                        ? formatDateTime(subscription.startDate).date
                        : fallback}
                    </Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}EndDate`)}
                    </Typography>
                    <Typography as="td">
                      {subscription.endDate ? formatDateTime(subscription.endDate).date : fallback}
                    </Typography>
                  </tr>
                  <Divider colSpan={2} />
                  {subscription.serviceItems?.map((serviceItem, index) => (
                    <ServiceItem serviceItem={serviceItem} key={serviceItem.id} index={index} />
                  ))}
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}PricePerBillingCycle`)}
                    </Typography>
                    <Typography as="td">{formatCurrency(subscription.grandTotal)}</Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}BillingType`)}
                    </Typography>
                    <Typography as="td">{startCase(subscription?.billingType)}</Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}BillingCycle`)}
                    </Typography>
                    <Typography as="td">{startCase(subscription?.billingCycle)}</Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}NextBillingDate`)}
                    </Typography>

                    <Typography as="td">
                      {subscription?.nextBillingPeriodTo && subscription?.nextBillingPeriodFrom
                        ? `${formatDateTime(subscription.nextBillingPeriodFrom).date} - ${
                            formatDateTime(subscription.nextBillingPeriodTo).date
                          }`
                        : fallback}
                    </Typography>
                  </tr>
                  <Divider colSpan={2} />
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {t(`${I18N_PATH}Note`)}
                    </Typography>
                  </tr>
                  <tr>
                    <Typography color="secondary" shade="desaturated" variant="bodyMedium" as="td">
                      {subscription?.driverInstructions ?? fallback}
                    </Typography>
                  </tr>
                </tbody>
              </Table>
            </Layouts.Padding>
          </Layouts.Scroll>

          <Layouts.Padding left="3" right="3" bottom="3">
            <Divider both />
            {hasFullAccessSubscriptions ? (
              <Button variant="primary" full to={detailsUrl}>
                {t(`${I18N_PATH}SubscriptionDetails`)} →
              </Button>
            ) : null}
            {(selectedTab !== SubscriptionTabRoutes.Closed || isNotCompetedSubscription) &&
            canModify ? (
              <Layouts.Margin top="2">
                <Button
                  full
                  to={pathToUrl(Paths.RequestModule.Subscription.Edit, {
                    businessUnit: businessUnitId,
                    subscriptionId: subscription.id,
                    entity: Routes.Subscription,
                  })}
                >
                  {t(`${I18N_PATH}EditSubscription`)}
                </Button>
              </Layouts.Margin>
            ) : null}
          </Layouts.Padding>
        </>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(SubscriptionQuickView));
