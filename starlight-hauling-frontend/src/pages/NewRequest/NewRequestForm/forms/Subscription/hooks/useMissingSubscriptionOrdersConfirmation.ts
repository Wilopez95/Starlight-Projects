import { useEffect, useMemo } from 'react';
import { FormikContextType } from 'formik';
import { isEqual, pick } from 'lodash-es';

import { useConfirmModal } from '@root/components/modals';
import { usePrevious } from '@hooks';

import { INewSubscription } from '../types';

export const useMissingSubscriptionOrdersConfirmation = () => {
  const { isModalOpen, openModal, closeModal, isConfirmed, confirm, unConfirm } = useConfirmModal();

  return {
    isModalOpen,
    openModal,
    closeModal,
    isConfirmed,
    confirm,
    unConfirm,
  };
};

export const useMissingSubscriptionOrderUnConfirm = (
  missingSubscriptionOrdersConfirmation: ReturnType<
    typeof useMissingSubscriptionOrdersConfirmation
  >,
  formik: FormikContextType<INewSubscription>,
) => {
  const { values } = formik;

  const subscriptionOrderRelatedData = useMemo(() => {
    return values.serviceItems.map(serviceItem => pick(serviceItem, ['quantity']));
  }, [values.serviceItems]);

  const prevSubscriptionOrderRelatedData = usePrevious(subscriptionOrderRelatedData);

  useEffect(() => {
    if (
      prevSubscriptionOrderRelatedData &&
      !isEqual(prevSubscriptionOrderRelatedData, subscriptionOrderRelatedData)
    ) {
      missingSubscriptionOrdersConfirmation.unConfirm();
    }
  }, [
    missingSubscriptionOrdersConfirmation.unConfirm,
    subscriptionOrderRelatedData,
    prevSubscriptionOrderRelatedData,
    missingSubscriptionOrdersConfirmation,
  ]);
};
