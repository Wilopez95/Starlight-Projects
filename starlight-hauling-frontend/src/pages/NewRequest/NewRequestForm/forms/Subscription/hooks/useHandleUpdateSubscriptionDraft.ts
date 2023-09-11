import { useCallback } from 'react';
import { useHistory } from 'react-router';
import { FormikContextType, validateYupSchema, yupToFormErrors } from 'formik';

import { FormStatuses, Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { reactionReminderSchedule } from '@root/stores/reminder/helpers';

import { generateSubscriptionValidationSchema } from '../formikData';
import { INewSubscription } from '../types';

import { useSubscriptionPayload } from './useSubscriptionPayload';

export const useHandleUpdateSubscriptionDraft = (formik: FormikContextType<INewSubscription>) => {
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const { subscriptionDraftStore, businessLineStore, reminderStore } = useStores();
  const { values, initialValues, setErrors, setSubmitting, setStatus } = formik;
  const { getSubscriptionDraftUpdatePayload } = useSubscriptionPayload(initialValues);
  const intl = useIntl();

  const handleUpdateDraft = useCallback(async () => {
    if (subscriptionDraftStore.selectedEntity) {
      const subscriptionPayload = getSubscriptionDraftUpdatePayload(
        values,
        subscriptionDraftStore.selectedEntity,
      );

      if (!subscriptionPayload) {
        return;
      }

      try {
        setSubmitting(true);
        await validateYupSchema<INewSubscription>(
          values,
          generateSubscriptionValidationSchema({ businessLineStore, isDraft: true, intl }),
        );

        await subscriptionDraftStore.update(subscriptionPayload);

        if (values.annualReminderConfig) {
          await reactionReminderSchedule(
            {
              customerId: values.customerId,
              entityId: values.id,
              ...values.annualReminderConfig,
            },
            reminderStore,
          );
        }

        if (!subscriptionDraftStore.isPreconditionFailed) {
          setStatus(FormStatuses.submitted);

          history.push(
            pathToUrl(Paths.SubscriptionModule.Subscriptions, {
              businessUnit: businessUnitId,
              tab: SubscriptionTabRoutes.Draft,
            }),
          );
        }
      } catch (errors) {
        setErrors(yupToFormErrors(errors));
      } finally {
        setSubmitting(false);
      }
    }
  }, [
    businessLineStore,
    businessUnitId,
    getSubscriptionDraftUpdatePayload,
    history,
    intl,
    setErrors,
    setStatus,
    setSubmitting,
    subscriptionDraftStore,
    values,
    reminderStore,
  ]);

  return handleUpdateDraft;
};
