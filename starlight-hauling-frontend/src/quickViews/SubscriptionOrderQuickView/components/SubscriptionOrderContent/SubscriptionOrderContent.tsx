import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { BillableItemActionEnum } from '@root/consts';
import { useStores } from '@root/hooks';

import { IQuickView } from '../../../types';
import JobSiteDetails from '../sections/JobSiteDetails/JobSiteDetails';
import LineItems from '../sections/LineItems/LineItems';
import NonServiceJobSiteDetails from '../sections/NonService/NonServiceJobSiteDetails/NonServiceJobSiteDetails';
import NonServiceSummary from '../sections/NonService/NonServiceSummary/NonServiceSummary';
import Notes from '../sections/Notes/Notes';
import OneTimeServicesBlock from '../sections/OneTimeServicesBlock/OneTimeServicesBlock';
import RecurringServicesBlock from '../sections/RecurringServicesBlock/RecurringServicesBlock';
import SubscriptionOrderDetails from '../sections/SubscriptionOrderDetails/SubscriptionOrderDetails';
import Summary from '../sections/Summary/Summary';
import WorkOrdersTable from '../sections/WorkOrdersTable/WorkOrdersTable';

const SubscriptionOrderContent: React.FC<IQuickView> = ({ tableContainerRef }) => {
  const { subscriptionOrderStore, subscriptionStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity!;
  const subscription = subscriptionStore.selectedEntity!;

  const { oneTime, billableService } = subscriptionOrder;
  const isNonServiceOrder = billableService.action === BillableItemActionEnum.nonService;

  return (
    <Layouts.Padding padding="3">
      <SubscriptionOrderDetails oneTime={oneTime} isNonServiceOrder={isNonServiceOrder} />
      <Notes />
      {isNonServiceOrder ? <NonServiceJobSiteDetails /> : <JobSiteDetails />}
      {oneTime ? (
        <OneTimeServicesBlock subscription={subscription} subscriptionOrder={subscriptionOrder} />
      ) : (
        <RecurringServicesBlock subscription={subscription} subscriptionOrder={subscriptionOrder} />
      )}
      {!isNonServiceOrder ? (
        <>
          <LineItems subscriptionOrder={subscriptionOrder} />
          <WorkOrdersTable
            subscriptionOrderId={subscriptionOrder.id}
            oneTime={oneTime}
            quickView={{
              tableContainerRef,
              size: 'full',
            }}
          />
          {oneTime ? (
            <Summary subscription={subscription} subscriptionOrder={subscriptionOrder} />
          ) : null}
        </>
      ) : (
        <NonServiceSummary />
      )}
    </Layouts.Padding>
  );
};

export default observer(SubscriptionOrderContent);
