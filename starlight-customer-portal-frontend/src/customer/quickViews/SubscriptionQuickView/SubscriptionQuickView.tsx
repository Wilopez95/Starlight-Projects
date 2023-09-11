import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Badge, Layouts, Typography } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Scroll } from '@root/core/common/Scroll/Scroll';
import { Divider, Table, TableQuickView, withQuickView } from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';

import * as QuickViewStyles from '../styles';

import ServiceItem from './ServiceItem/ServiceItem';
import { ISubscriptionQuickView } from './types';

const fallback = '-';
const I18N_PATH = 'components.SubscriptionQuickView.';

const SubscriptionQuickView: React.FC<ISubscriptionQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
}) => {
  const { subscriptionStore } = useStores();
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useIntl();
  const subscription = subscriptionStore.selectedEntity;

  const { customerId } = useParams<{ customerId: string }>();

  useEffect(() => {
    if (subscriptionStore.selectedEntity?.id) {
      subscriptionStore.requestById(subscriptionStore.selectedEntity.id, { customerId });
    }
  }, [subscriptionStore, subscriptionStore.selectedEntity?.id, customerId]);

  const handleCancel = useCallback(() => subscriptionStore.unSelectEntity(), [subscriptionStore]);

  if (!subscription) {
    return null;
  }

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
            <QuickViewStyles.CrossIcon onClick={onCancel} />

            <div className={tableQuickViewStyles.dataContainer}>
              <div className={tableQuickViewStyles.quickViewTitle}>
                Subscription #{subscription.id}
              </div>

              <div className={tableQuickViewStyles.quickViewDescription}>
                <Badge borderRadius={2} color={subscription.colorByStatus}>
                  {startCase(subscription.status)}
                </Badge>
              </div>
            </div>
          </div>
          <Divider top />
          <Scroll height={scrollContainerHeight}>
            <Layouts.Padding padding='3'>
              <Table className={tableQuickViewStyles.table}>
                <tbody>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}LineOfBusiness`)}
                    </Typography>
                    <Typography as='td'>{subscription.businessLine.name}</Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}ServiceArea`)}{' '}
                    </Typography>
                    <Typography as='td'>{subscription.serviceArea?.name ?? fallback}</Typography>
                  </tr>
                  <Divider colSpan={2} />
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}Created`)}{' '}
                    </Typography>
                    <td>
                      <Typography as='span'>
                        {/* todo: add timezone here */}
                        {formatDateTime(subscription.createdAt).time} ・
                      </Typography>
                      <Typography as='span' color='secondary' shade='desaturated'>
                        {formatDateTime(subscription.createdAt).date}
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}CSR`)}{' '}
                    </Typography>
                    <Typography as='td'>{subscription.csrName}</Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}Customer`)}{' '}
                    </Typography>
                    <Typography as='td'>{subscription.customerName}</Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}JobSite`)}{' '}
                    </Typography>
                    <Typography as='td'>{subscription.jobSiteAddress}</Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}StartDate`)}{' '}
                    </Typography>
                    <Typography as='td'>
                      {subscription.startDate
                        ? formatDateTime(subscription.startDate).date
                        : fallback}
                    </Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}EndDate`)}{' '}
                    </Typography>
                    <Typography as='td'>
                      {subscription.endDate ? formatDateTime(subscription.endDate).date : fallback}
                    </Typography>
                  </tr>
                  <Divider colSpan={2} />
                  {subscription.serviceItems?.map((serviceItem, index) => (
                    <ServiceItem serviceItem={serviceItem} key={serviceItem.id} index={index} />
                  ))}
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}PricePerBillingCycle`)}{' '}
                    </Typography>
                    <Typography as='td'>{formatCurrency(subscription.grandTotal)}</Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}BillingType`)}
                    </Typography>
                    <Typography as='td'>{startCase(subscription?.billingType)}</Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}BillingCycle`)}
                    </Typography>
                    <Typography as='td'>{startCase(subscription?.billingCycle)}</Typography>
                  </tr>
                  <tr>
                    <Typography color='secondary' shade='desaturated' variant='bodyMedium' as='td'>
                      {t(`${I18N_PATH}NextBillingDate`)}
                    </Typography>

                    <Typography as='td'>
                      {formatDateTime(subscription.nextBillingPeriodFrom).date} -{' '}
                      {formatDateTime(subscription.nextBillingPeriodTo).date}
                    </Typography>
                  </tr>
                </tbody>
              </Table>
            </Layouts.Padding>
          </Scroll>
        </>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(SubscriptionQuickView));
