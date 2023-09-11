import { useProtected } from '@starlightpro/common';
import {
  CustomerTruckTypes,
  useGetCustomerTruckLazyQuery,
  useGetEquipmentItemLazyQuery,
} from '../../../graphql/api';
import { useField } from 'react-final-form';
import { useEffect } from 'react';

export const useUserIsAllowedToWeightOutOrder = () => {
  return useProtected({
    permissions: ['recycling:Order:weightout', 'recycling:YardConsole:perform'],
  });
};

export const useUserIsAllowedToDoneBypassScale = () => {
  const {
    input: { value: customerTruck },
  } = useField('customerTruck', { subscription: { value: true } });
  const {
    input: { value: containerId },
  } = useField('containerId', { subscription: { value: true } });

  const [getContainer, { data: container }] = useGetEquipmentItemLazyQuery({
    variables: { id: containerId },
    fetchPolicy: 'no-cache',
  });
  const [getCustomerTruck, { data: customerTruckData }] = useGetCustomerTruckLazyQuery({
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (containerId) {
      getContainer({ variables: { id: Number(containerId) } });
    }
  }, [containerId, getContainer]);

  useEffect(() => {
    if (customerTruck?.id) {
      getCustomerTruck({ variables: { id: Number(customerTruck?.id) } });
    }
  }, [customerTruck?.id, getCustomerTruck]);

  const truckTareWeight = (customerTruck?.id && customerTruckData?.customerTruck.emptyWeight) || 0;
  const containerTareWeight = (containerId && container?.equipment.emptyWeight) || 0;

  return customerTruckData?.customerTruck.type !== CustomerTruckTypes.Rolloff
    ? truckTareWeight
    : truckTareWeight && containerTareWeight;
};
