import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api/global/global';
import { Protected, Shadow, UnsavedChangesPrompt } from '@root/common';
import { FormContainer } from '@root/components';
import {
  ConfirmMissingSubscriptionOrderModal,
  OverrideSubscriptionLimit,
  SubscriptionOnHoldModal,
} from '@root/components/modals';
import { CustomerStatus, FormStatuses, Paths, Routes, SubscriptionTabRoutes } from '@root/consts';
import { convertDates, getSubscriptionChanges, pathToUrl } from '@root/helpers';
import {
  editableLineItemProps,
  editableServiceItemProps,
  editableSubscriptionOrderProps,
  editableSubscriptionProps,
} from '@root/helpers/getSubscriptionChanges/consts';
import {
  useBeforeUnloadConfirmation,
  useBoolean,
  useBusinessContext,
  useCrudPermissions,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { reactionReminderSchedule } from '@root/stores/reminder/helpers';
import {
  ISubscription,
  ISubscriptionDraft,
  ISubscriptionOnHoldDetails,
  SubscriptionStatusEnum,
} from '@root/types';

import { SaveDraftSubscriptionFlow } from '../../components/buttons';
import { BusinessLineAndService } from '../../components/selectors';

import { getDriverInstructionsTemplate } from '../Order/helpers/getDriverInstructions';
import { hasMissingSubscriptionOrders } from './helpers/hasMissingSubscriptionOrders';
import { generateSubscriptionValidationSchema, newSubscriptionFormValue } from './formikData';
import {
  useCalculatePrices,
  useCreateSubscription,
  useHandleUpdateSubscriptionDraft,
  useMissingSubscriptionOrdersConfirmation,
  useMissingSubscriptionOrderUnConfirm,
  useSubscriptionPayload,
} from './hooks';
import { JobSiteSection, OrderSection, SummarySection } from './sections';
import { INewSubscription, INewSubscriptionForm, INewSubscriptionFormParams } from './types';

const requestLimit = 6;

const I18N_PATH = buildI18Path('pages.NewRequest.NewRequestForm.forms.NewSubscriptionForm.');

const NewSubscriptionForm: React.FC<INewSubscriptionForm> = ({
  commonValues,
  subscriptionValues,
  onOrdersChange,
  isClone,
}) => {
  const history = useHistory();
  const { entity: entityParam } = useParams<INewSubscriptionFormParams>();
  const { businessUnitId } = useBusinessContext();
  const [canViewSubscriptionsList] = useCrudPermissions('subscriptions', 'all');
  const [canViewMySubscriptionsList] = useCrudPermissions('subscriptions', 'own');
  const intl = useIntl();

  const isSubscriptionEdit = entityParam === Routes.Subscription && !isClone;
  const isSubscriptionDraftEdit = entityParam === Routes.SubscriptionDraft;

  const missingSubscriptionOrdersConfirmation = useMissingSubscriptionOrdersConfirmation();

  const [isOnHoldModalOpen, handleOpenOnHold, handleCloseOnHold] = useBoolean();
  const [
    isUnsavedChangesPromptOpen,
    handleOpenUnsavedChangesPrompt,
    handleCloseUnsavedChangesPrompt,
  ] = useBoolean();
  const [
    isReviewProrationModalOpen,
    handleOpenReviewProrationModal,
    handleCloseReviewProprationModal,
  ] = useBoolean();
  const [isLimitExceedModalOpen, showLimitExceedModal, hideLimitExceedModal] = useBoolean();

  const {
    jobSiteStore,
    customerStore,
    projectStore,
    subscriptionStore,
    subscriptionDraftStore,
    businessLineStore,
    reminderStore,
  } = useStores();

  const { t } = useTranslation();

  const backToSubscriptionRoute = pathToUrl(Paths.SubscriptionModule.Subscriptions, {
    businessUnit: businessUnitId,
    tab: SubscriptionTabRoutes.Active,
  });

  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;
  const balances = selectedCustomer?.balances;
  const customer = customerStore.selectedEntity;

  const initialValues = useMemo(
    () => subscriptionValues ?? { ...newSubscriptionFormValue, ...commonValues },
    [commonValues, subscriptionValues],
  );

  useEffect(() => {
    if (selectedCustomer) {
      selectedCustomer.requestBalances();
    }
  }, [selectedCustomer, customerStore]);

  const handleCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  const { getSubscriptionCreatePayload, getSubscriptionUpdatePayload } =
    useSubscriptionPayload(initialValues);

  const handleSubscriptionCreate = useCallback(
    async (values: INewSubscription, setStatus: (status: string) => void) => {
      const subscriptionPayload = getSubscriptionCreatePayload(values);

      if (!subscriptionPayload) {
        return;
      }

      const response = isSubscriptionDraftEdit
        ? await subscriptionDraftStore.updateStatusToActive(values.id, subscriptionPayload)
        : await subscriptionStore.create(subscriptionPayload);
      await subscriptionStore.request({ businessUnitId });
      if (response?.id) {
        if (values.annualReminderConfig?.date && selectedCustomer?.id) {
          await reactionReminderSchedule(
            {
              customerId: selectedCustomer.id,
              entityId: response.id,
              ...values.annualReminderConfig,
            },
            reminderStore,
          );
        }
        await subscriptionStore.requestCount({
          businessUnitId: subscriptionPayload?.businessUnitId,
        });
        setStatus(FormStatuses.submitted);
        history.push(backToSubscriptionRoute);
      } else if (subscriptionStore.paymentError) {
        showLimitExceedModal();
      }
    },
    [
      backToSubscriptionRoute,
      getSubscriptionCreatePayload,
      isSubscriptionDraftEdit,
      subscriptionDraftStore,
      showLimitExceedModal,
      subscriptionStore,
      selectedCustomer, // TODO: review this later
      reminderStore,
      history,
    ],
  );

  const handleSubscriptionUpdate = useCallback(
    async (
      values: INewSubscription,
      selectedEntity: ISubscription | ISubscriptionDraft,
      setStatus: (status: string) => void,
    ) => {
      const configurableSubscription = getSubscriptionUpdatePayload(values, selectedEntity);

      if (!configurableSubscription) {
        return;
      }

      await subscriptionStore.update(configurableSubscription);

      if (values.annualReminderConfig) {
        await reactionReminderSchedule(
          {
            customerId: selectedCustomer?.id,
            entityId: values.id,
            ...values.annualReminderConfig,
          },
          reminderStore,
        );
      }

      if (subscriptionStore.isPreconditionFailed) {
        return;
      }

      if (subscriptionStore.paymentError) {
        showLimitExceedModal();

        return;
      }

      setStatus(FormStatuses.submitted);
      history.push(backToSubscriptionRoute);
    },
    [
      subscriptionStore,
      getSubscriptionUpdatePayload,
      showLimitExceedModal,
      backToSubscriptionRoute,
      reminderStore,
      history,
      selectedCustomer, // TODO: review it later
    ],
  );

  const handlePlace = useCallback(
    (values: INewSubscription, { setStatus }: FormikHelpers<INewSubscription>) => {
      if (
        !missingSubscriptionOrdersConfirmation.isConfirmed &&
        hasMissingSubscriptionOrders(values.serviceItems, initialValues.serviceItems)
      ) {
        missingSubscriptionOrdersConfirmation.openModal();

        return;
      }

      if (values.showProrationButton) {
        handleOpenReviewProrationModal();

        return;
      }

      if (isSubscriptionEdit && subscriptionStore.selectedEntity) {
        handleSubscriptionUpdate(values, subscriptionStore.selectedEntity, setStatus);
      } else {
        handleSubscriptionCreate(values, setStatus);
      }
    },
    [
      missingSubscriptionOrdersConfirmation,
      initialValues.serviceItems,
      isSubscriptionEdit,
      subscriptionStore.selectedEntity,
      handleOpenReviewProrationModal,
      handleSubscriptionUpdate,
      handleSubscriptionCreate,
    ],
  );

  const formik = useFormik<INewSubscription>({
    initialValues,
    validationSchema: generateSubscriptionValidationSchema({
      businessLineStore,
      isSubscriptionEdit,
      intl,
    }),
    validateOnChange: false,
    validateOnBlur: false,
    initialErrors: {},
    onSubmit: handlePlace,
    onReset: noop,
    enableReinitialize: true,
  });

  const { values, errors, isSubmitting, status, submitForm, setFieldValue, setFormikState } =
    formik;

  const { setFieldError: setFieldErrorNewRequestForm } = useFormikContext<INewSubscription>();

  useCreateSubscription(formik);

  const isUnsavedChangesConfirmationEnabled =
    (isSubscriptionEdit || isSubscriptionDraftEdit || !!isClone) &&
    status !== FormStatuses.submitted;
  const isSubscriptionClosed = values.status === SubscriptionStatusEnum.Closed;

  const handleUnsavedChangesAdditionalCondition = useCallback(() => {
    const diff = getSubscriptionChanges(initialValues, values, {
      editableSubscriptionProps,
      editableServiceItemProps,
      editableLineItemProps,
      editableSubscriptionOrderProps,
      skipComparisonPropsForRemoved: true,
      skipComparisonAddedItem: true,
    });

    return !isEmpty(diff);
  }, [initialValues, values]);

  useEffect(() => {
    if (errors.serviceAreaId) {
      setFieldErrorNewRequestForm('serviceAreaId', errors.serviceAreaId);
    }
  }, [errors.serviceAreaId, setFieldErrorNewRequestForm]);

  useScrollOnError(errors, isSubmitting);
  useBeforeUnloadConfirmation(isUnsavedChangesConfirmationEnabled);

  const { proration } = useCalculatePrices(formik);

  const handleUpdateSubscriptionDraft = useHandleUpdateSubscriptionDraft(formik);

  const handleUnsavedChangesSubmit = useCallback(() => {
    if (isSubscriptionDraftEdit) {
      handleUpdateSubscriptionDraft();
    } else {
      submitForm();
    }
  }, [handleUpdateSubscriptionDraft, isSubscriptionDraftEdit, submitForm]);

  useMissingSubscriptionOrderUnConfirm(missingSubscriptionOrdersConfirmation, formik);

  useEffect(() => {
    if (selectedCustomer?.id && selectedJobSite?.id && values.serviceAreaId) {
      projectStore.cleanup();

      (async () => {
        try {
          const pair = convertDates(
            await GlobalService.getJobSiteCustomerPair(selectedJobSite.id, selectedCustomer.id),
          );

          const driverInstructionsTemplate = getDriverInstructionsTemplate(selectedCustomer, pair);

          if (pair) {
            setFormikState(prevState => ({
              ...prevState,
              values: {
                ...prevState.values,
                customerJobSiteId: pair.id,
                popupNote: pair.popupNote ?? '',
                permitRequired: pair.permitRequired ?? false,
                alleyPlacement: pair.alleyPlacement ?? false,
                poRequired: pair.poRequired ?? false,
                signatureRequired: pair.signatureRequired ?? false,
                workOrderNote: pair.workOrderNotes ?? '',
                driverInstructions:
                  prevState.values.driverInstructions ?? driverInstructionsTemplate,
              },
            }));

            projectStore.request({
              customerJobSiteId: pair.id,
              limit: requestLimit,
            });
          } else {
            setFormikState(prevState => ({
              ...prevState,
              values: {
                ...prevState.values,
                customerJobSiteId: null,
                poRequired: selectedCustomer.poRequired,
                signatureRequired: selectedCustomer.signatureRequired,
                alleyPlacement: selectedJobSite.alleyPlacement,
                driverInstructions:
                  prevState.values.driverInstructions ?? driverInstructionsTemplate,
              },
            }));
          }
        } catch {
          setFormikState(prevState => ({
            ...prevState,
            values: {
              ...prevState.values,
              customerJobSiteId: null,
              poRequired: selectedCustomer.poRequired,
              signatureRequired: selectedCustomer.signatureRequired,
              driverInstructions:
                prevState.values.driverInstructions ??
                getDriverInstructionsTemplate(selectedCustomer),
            },
          }));
        }
      })();
    }
  }, [
    selectedCustomer,
    selectedJobSite,
    projectStore,
    setFieldValue,
    setFormikState,
    values.serviceAreaId,
  ]);

  const nonInvoicedTotal = balances?.nonInvoicedTotal ?? 0;

  const handleSubscriptionOnHold = useCallback(
    (newValues: ISubscriptionOnHoldDetails) => {
      setFormikState(prevState => ({
        ...prevState,
        values: {
          ...prevState.values,
          ...newValues,
          onHold: true,
        },
      }));

      handleOpenUnsavedChangesPrompt();
      handleCloseOnHold();
    },
    [handleCloseOnHold, setFormikState, handleOpenUnsavedChangesPrompt],
  );

  const subscriptionOrdersTotal = useMemo(
    () => proration?.grandTotal ?? 0 + nonInvoicedTotal,
    [proration?.grandTotal, nonInvoicedTotal],
  );

  const handleOnResume = useCallback(() => {
    hideLimitExceedModal();
    setFieldValue('offHold', true);
    handleOpenUnsavedChangesPrompt();
  }, [setFieldValue, hideLimitExceedModal, handleOpenUnsavedChangesPrompt]);

  const handleConfirmCreditLimitOverride = useCallback(() => {
    subscriptionStore.cleanPaymentError();
    setFieldValue('overrideCreditLimit', true);
    submitForm();
    hideLimitExceedModal();
  }, [hideLimitExceedModal, setFieldValue, submitForm, subscriptionStore]);

  const handleConfirmMissionSubscriptionOrder = useCallback(() => {
    missingSubscriptionOrdersConfirmation.confirm();
    submitForm();
  }, [missingSubscriptionOrdersConfirmation, submitForm]);

  useEffect(() => {
    onOrdersChange(subscriptionOrdersTotal);
  }, [onOrdersChange, subscriptionOrdersTotal]);

  const allowHold =
    isSubscriptionEdit &&
    values.status === SubscriptionStatusEnum.Active &&
    (canViewSubscriptionsList || canViewMySubscriptionsList);
  const allowResume =
    isSubscriptionEdit &&
    values.status === SubscriptionStatusEnum.OnHold &&
    (canViewSubscriptionsList || canViewMySubscriptionsList);

  return (
    <>
      <BusinessLineAndService
        readOnly={isSubscriptionEdit || isSubscriptionDraftEdit}
        isCloneSubscription={isClone}
      />
      <FormContainer formik={formik} noValidate>
        <UnsavedChangesPrompt
          when={isUnsavedChangesConfirmationEnabled}
          additionalCondition={handleUnsavedChangesAdditionalCondition}
          onSubmit={handleUnsavedChangesSubmit}
          hidePrompt={handleCloseUnsavedChangesPrompt}
          isPromptOpen={isUnsavedChangesPromptOpen}
        />
        <SubscriptionOnHoldModal
          isOpen={isOnHoldModalOpen}
          onClose={handleCloseOnHold}
          onFormSubmit={handleSubscriptionOnHold}
        />
        <ConfirmMissingSubscriptionOrderModal
          isOpen={missingSubscriptionOrdersConfirmation.isModalOpen}
          onCancel={missingSubscriptionOrdersConfirmation.closeModal}
          onSubmit={handleConfirmMissionSubscriptionOrder}
        />
        <OverrideSubscriptionLimit
          isOpen={isLimitExceedModalOpen}
          onSubmit={handleConfirmCreditLimitOverride}
          onCancel={hideLimitExceedModal}
        />

        <JobSiteSection isSubscriptionClosed={isSubscriptionClosed} />
        <OrderSection isSubscriptionClosed={isSubscriptionClosed} isClone={isClone ?? false} />
        <SummarySection
          proration={proration}
          isSubscriptionClosed={isSubscriptionClosed}
          subscriptionValues={subscriptionValues}
          isReviewProrationModalOpen={isReviewProrationModalOpen}
          onOpenReviewProrationModal={handleOpenReviewProrationModal}
          onCloseReviewProrationModal={handleCloseReviewProprationModal}
        />
        <Shadow variant="default">
          <Layouts.Box backgroundColor="white">
            <Layouts.Padding padding="3">
              <Layouts.Flex justifyContent="space-between">
                <Button type="button" onClick={handleCancel}>
                  {t('Text.Cancel')}
                </Button>
                <Layouts.Flex>
                  {!isSubscriptionEdit ? (
                    <SaveDraftSubscriptionFlow isSubscriptionClone={isClone ?? false} />
                  ) : null}
                  {allowHold ? (
                    <Protected permissions="subscriptions:put-on-hold:perform">
                      <Layouts.Margin right="2">
                        <Button onClick={handleOpenOnHold} disabled={subscriptionStore.loading}>
                          {t(`${I18N_PATH.Text}OnHold`)}
                        </Button>
                      </Layouts.Margin>
                    </Protected>
                  ) : null}
                  {allowResume ? (
                    <Protected permissions="subscriptions:put-on-hold:perform">
                      <Layouts.Margin right="2">
                        <Button
                          onClick={handleOnResume}
                          disabled={
                            subscriptionStore.loading || customer?.status === CustomerStatus.onHold
                          }
                        >
                          {t(`${I18N_PATH.Text}Resume`)}
                        </Button>
                      </Layouts.Margin>
                    </Protected>
                  ) : null}
                  <Button variant="primary" type="submit" disabled={subscriptionStore.loading}>
                    {isSubscriptionEdit
                      ? t(`${I18N_PATH.Text}SaveChanges`)
                      : t(`${I18N_PATH.Text}PlaceNewSubscription`)}
                  </Button>
                </Layouts.Flex>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Box>
        </Shadow>
      </FormContainer>
    </>
  );
};

export default observer(NewSubscriptionForm);
