import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { Modal } from '@root/common';
import { LinkSubscriptionOrderForm } from '@root/components/forms';
import { useBusinessContext, useStores } from '@root/hooks';
import { SubscriptionStatusEnum } from '@root/types';

import { ILinkSubscriptionOrderModal } from './types';

import styles from './css/styles.scss';

const LinkSubscriptionOrderModal: React.FC<ILinkSubscriptionOrderModal> = ({
  title,
  customerId,
  businessLineId,
  jobSiteId,
  serviceAreaId,
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  const { businessUnitId } = useBusinessContext();
  const { subscriptionStore } = useStores();

  useEffect(() => {
    if (isOpen && customerId && businessLineId) {
      subscriptionStore.cleanup();
      subscriptionStore.request({
        status: SubscriptionStatusEnum.Active,
        businessUnitId,
        customerId,
        businessLine: businessLineId,
        jobSiteId,
        serviceAreaId,
      });
    }
  }, [
    isOpen,
    subscriptionStore,
    businessUnitId,
    customerId,
    businessLineId,
    jobSiteId,
    serviceAreaId,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <LinkSubscriptionOrderForm
        title={title}
        subscriptions={subscriptionStore.values}
        onSubmit={onFormSubmit}
        onClose={onClose}
      />
    </Modal>
  );
};

export default observer(LinkSubscriptionOrderModal);
