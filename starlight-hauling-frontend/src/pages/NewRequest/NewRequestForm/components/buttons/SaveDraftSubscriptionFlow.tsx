import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormikContext, validateYupSchema, yupToFormErrors } from 'formik';
import { observer } from 'mobx-react-lite';

import { ReminderConfigurationModal } from '@root/components/modals';
import { FormStatuses, Paths, SubscriptionTabRoutes } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { useBoolean, useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { generateSubscriptionValidationSchema } from '../../forms/Subscription/formikData';
import {
  useHandleUpdateSubscriptionDraft,
  useSubscriptionPayload,
} from '../../forms/Subscription/hooks';
import { INewSubscription } from '../../forms/Subscription/types';

import { IConfigurableReminderSchedule } from '../../../../../types';
import { ISaveDraftSubscriptionButton } from './types';

const SaveDraftSubscriptionFlow: React.FC<ISaveDraftSubscriptionButton> = ({
  isSubscriptionClone = false,
}) => {
  const formik = useFormikContext<INewSubscription>();
  const { values, initialValues, setErrors, setSubmitting, setStatus } = formik;
  const { subscriptionDraftStore, businessLineStore, reminderStore } = useStores();
  const [isReminderConfigModalOpen, handleReminderConfigModalOpen, handleReminderConfigModalClose] =
    useBoolean();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const intl = useIntl();
  const { t } = useTranslation();
  const isEdit = values.id !== 0;

  const { getSubscriptionDraftCreatePayload } = useSubscriptionPayload(initialValues);

  useEffect(() => {
    reminderStore.clearConfig();
  }, [reminderStore]);

  const handleCreateDraft = useCallback(
    async reminderConfig => {
      const subscriptionPayload = getSubscriptionDraftCreatePayload(values);

      if (!subscriptionPayload) {
        return;
      }

      try {
        const response = await subscriptionDraftStore.create(subscriptionPayload);

        if (response?.id) {
          setStatus(FormStatuses.submitted);

          history.push(
            pathToUrl(Paths.SubscriptionModule.Subscriptions, {
              businessUnit: businessUnitId,
              tab: SubscriptionTabRoutes.Draft,
            }),
          );

          const { customerId } = subscriptionPayload;

          if (reminderConfig && customerId) {
            await reminderStore.createReminderSchedule({
              customerId,
              entityId: response.id,
              ...reminderConfig,
            } as IConfigurableReminderSchedule);
          }

          if (values.annualReminderConfig?.date && customerId) {
            await reminderStore.createReminderSchedule({
              customerId,
              entityId: response.id,
              ...values.annualReminderConfig,
            });
          }
        }
      } catch (errors) {
        NotificationHelper.error('default');
      }
    },
    [
      reminderStore,
      getSubscriptionDraftCreatePayload,
      values,
      subscriptionDraftStore,
      history,
      businessUnitId,
      setStatus,
    ],
  );

  const handleUpdateDraft = useHandleUpdateSubscriptionDraft(formik);

  const handleCreateDraftFlow = useCallback(async () => {
    try {
      setSubmitting(true);
      await validateYupSchema<INewSubscription>(
        values,
        generateSubscriptionValidationSchema({ businessLineStore, isDraft: true, intl }),
      );
      handleReminderConfigModalOpen();
    } catch (errors) {
      setErrors(yupToFormErrors(errors));
    } finally {
      setSubmitting(false);
    }
  }, [values, setSubmitting, handleReminderConfigModalOpen, businessLineStore, setErrors, intl]);

  return (
    <>
      <ReminderConfigurationModal
        isOpen={isReminderConfigModalOpen}
        onClose={handleReminderConfigModalClose}
        onFormSubmit={handleCreateDraft}
      />

      <Layouts.Margin right="2">
        <Button
          variant="primary"
          onClick={isEdit && !isSubscriptionClone ? handleUpdateDraft : handleCreateDraftFlow}
        >
          {t('Text.Save')}
        </Button>
      </Layouts.Margin>
    </>
  );
};

export default observer(SaveDraftSubscriptionFlow);
