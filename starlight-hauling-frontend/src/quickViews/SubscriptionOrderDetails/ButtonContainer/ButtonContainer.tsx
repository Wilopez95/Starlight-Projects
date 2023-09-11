import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Layouts, MAX_FILE_SIZE } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import ConfirmModal from '@root/components/modals/Confirm/Confirm';
import { CustomerSubscriptionParams } from '@root/components/PageLayouts/CustomerSubscriptionLayout/types';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBoolean, useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { mapCompletedSubscriptionOrder } from '@root/stores/subscriptionOrder/sanitize';
import { IConfigurableSubscriptionOrder } from '@root/types';

import { getButtons } from './Buttons';
import { UpdateStatusFunction } from './types';

const I18N_PATH = `quickViews.SubscriptionOrderDetails.ButtonContainer.ButtonContainer.Text.`;

const ButtonContainer: React.FC = () => {
  const { subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const { values, validateForm, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionOrder>();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const { dateFormat } = useIntl();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const [isOverrideModalOpen, showOverrideModal, hideOverrideModal] = useBoolean();
  const submitCallback = useRef<UpdateStatusFunction>();
  const { customerId } = useParams<CustomerSubscriptionParams>();

  const handleOverrideCancel = useCallback(() => {
    hideOverrideModal();
    subscriptionOrderStore.cleanPaymentError();
  }, [subscriptionOrderStore, hideOverrideModal]);

  const handleOverrideConfirm = useCallback(async () => {
    handleOverrideCancel();

    if (submitCallback.current && subscriptionOrder?.sequenceId) {
      const data = {
        id: values.id,
        subscriptionOrder: mapCompletedSubscriptionOrder(
          {
            ...values,
            overrideCreditLimit: true,
          },
          dateFormat,
        ),
        businessUnitId,
        refreshCount: !customerId,
        sequenceId: subscriptionOrder.sequenceId,
      };

      await submitCallback.current(data);
    }
    subscriptionOrderStore.closeDetails();
  }, [
    values,
    handleOverrideCancel,
    subscriptionOrderStore,
    businessUnitId,
    customerId,
    dateFormat,
    subscriptionOrder?.sequenceId,
  ]);

  const handleSubmit = useCallback(
    async (callback: UpdateStatusFunction) => {
      const errors = await validateForm();

      if (!subscriptionOrder?.sequenceId) {
        return;
      }

      const totalFilesSize =
        values.mediaFiles?.reduce(
          (total: number, file) => total + (file instanceof File ? file.size : 0),
          0,
        ) ?? 0;

      if (!isEmpty(errors)) {
        if (!values.unlockOverrides) {
          setFieldValue('unlockOverrides', true);
        }

        return;
      }

      if (totalFilesSize > MAX_FILE_SIZE) {
        NotificationHelper.error('images', ActionCode.FILE_TOO_LARGE);

        return;
      }

      const data = {
        id: values.id,
        subscriptionOrder: mapCompletedSubscriptionOrder(values, dateFormat),
        businessUnitId,
        refreshCount: !customerId,
        sequenceId: subscriptionOrder?.sequenceId,
      };

      await callback(data);
      subscriptionWorkOrderStore.removeWorkOrdersBySubscriptionOrderId(values.id);
      if (subscriptionOrderStore.paymentError) {
        submitCallback.current = callback;
        showOverrideModal();
      } else {
        subscriptionOrderStore.closeDetails();
      }
    },
    [
      values,
      businessUnitId,
      customerId,
      subscriptionOrderStore,
      validateForm,
      dateFormat,
      setFieldValue,
      showOverrideModal,
      subscriptionWorkOrderStore,
      subscriptionOrder?.sequenceId,
    ],
  );

  const ButtonsComponent = getButtons(subscriptionOrder?.status);

  return (
    <>
      <ConfirmModal
        isOpen={isOverrideModalOpen}
        cancelButton={t(`${I18N_PATH}EditOrder`)}
        submitButton={t(`Text.OverrideLimit`)}
        title={t(`${I18N_PATH}Title`)}
        subTitle={t(`${I18N_PATH}SubTitle`)}
        onCancel={handleOverrideCancel}
        onSubmit={handleOverrideConfirm}
        nonDestructive
      />
      <Layouts.Flex justifyContent="flex-end">
        {ButtonsComponent ? <ButtonsComponent onSubmit={handleSubmit} /> : null}
      </Layouts.Flex>
    </>
  );
};

export default observer(ButtonContainer);
