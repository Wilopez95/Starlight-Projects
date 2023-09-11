import React, { useEffect, useRef, useState } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/common/TableTools';
import ReminderConfigurationModal from '@root/components/modals/ReminderConfigurationModal';
import {
  CustomerSubscriptionLayout,
  CustomerSubscriptionNavigation,
} from '@root/components/PageLayouts';
import { useBoolean, useStores } from '@root/hooks';
import { IConfigurableReminderSchedule, ReminderTypes } from '@root/types';

import CompetitorDetails from './components/CompetitorDetails/CompetitorDetails';
import { JobSiteDetails, ServiceList, SubscriptionDetails, Summary } from './components';
import { IOnHoldModal } from './types';

const CustomerSubscriptionDetails: React.FC = () => {
  const subscriptionNavigationRef = useRef<HTMLDivElement>(null);
  const { subscriptionDraftStore, reminderStore } = useStores();
  const [{ updateOnly, isOnHoldModalOpen }, setOnHoldModal] = useState<IOnHoldModal>({
    updateOnly: false,
    isOnHoldModalOpen: false,
  });
  const [isReminderConfigModalOpen, handleReminderConfigModalOpen, handleReminderConfigModalClose] =
    useBoolean();

  const draftSubscription = subscriptionDraftStore.selectedEntity;

  useEffect(() => {
    if (draftSubscription?.id) {
      reminderStore.getReminderScheduleBy(draftSubscription.id, ReminderTypes.ProspectReminder);
    }
  }, [reminderStore, draftSubscription?.id]);

  const handleReminderScheduleSubmit = (reminderConfig: IConfigurableReminderSchedule) => {
    if (reminderConfig && draftSubscription && !reminderStore.currentReminderConfig) {
      reminderStore.createReminderSchedule({
        customerId: draftSubscription.customer.id,
        entityId: draftSubscription.id,
        ...reminderConfig,
      });
    } else if (reminderConfig && reminderStore.currentReminderConfig?.id) {
      reminderStore.updateReminderSchedule(reminderStore.currentReminderConfig.id, reminderConfig);
    } else if (!reminderConfig && reminderStore.currentReminderConfig?.id) {
      reminderStore.deleteReminderSchedule(reminderStore.currentReminderConfig.id);
    }
  };

  return (
    <CustomerSubscriptionLayout
      updateOnly={updateOnly}
      isOnHoldModalOpen={isOnHoldModalOpen}
      setReminderConfigModalOpen={handleReminderConfigModalOpen}
      setOnHoldModal={setOnHoldModal}
    >
      <ReminderConfigurationModal
        isOpen={isReminderConfigModalOpen}
        onClose={handleReminderConfigModalClose}
        onFormSubmit={handleReminderScheduleSubmit}
      />
      <CustomerSubscriptionNavigation ref={subscriptionNavigationRef} />
      <Layouts.Flex
        as={Layouts.Box}
        height="100%"
        direction="column"
        backgroundColor="white"
        overflowHidden
      >
        <Layouts.Scroll>
          <Layouts.Padding padding="3">
            <SubscriptionDetails
              setReminderConfigModalOpen={handleReminderConfigModalOpen}
              setOnHoldModal={setOnHoldModal}
            />
            <Divider />
            <JobSiteDetails />
            <Divider />
            <CompetitorDetails />
            <ServiceList />
            <Summary />
          </Layouts.Padding>
        </Layouts.Scroll>
      </Layouts.Flex>
    </CustomerSubscriptionLayout>
  );
};

export default observer(CustomerSubscriptionDetails);
