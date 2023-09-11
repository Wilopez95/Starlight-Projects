import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import ServiceItem from '../ServiceItem/ServiceItem';

const ServiceList: React.FC = () => {
  const { subscriptionStore, subscriptionDraftStore } = useStores();
  const subscription = subscriptionStore.selectedEntity ?? subscriptionDraftStore.selectedEntity;

  return (
    <>
      {subscription?.serviceItems?.map((service, index) => (
        <ServiceItem key={service.id} index={index} service={service} />
      ))}
    </>
  );
};

export default observer(ServiceList);
