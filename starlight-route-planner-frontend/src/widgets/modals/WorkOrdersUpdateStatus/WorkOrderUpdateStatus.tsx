import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainer,
  Layouts,
  Select,
  TextInput,
  Typography,
} from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { StatusesSelect } from '@root/common/StatusesSelect';
import { Divider } from '@root/common/TableTools';
import { availableWorkOrdersStatuses } from '@root/config';
import { WorkOrderStatus } from '@root/consts/workOrder';
import { useBusinessContext, useStores } from '@root/hooks';
import { CancellationReason } from '@root/types';

import { UnableToEditWO } from '../UnableToEditWO';

import { defaultValues, validationSchema } from './formikData';
import { Modal } from './styles';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'components.modals.WorkOrderUpdateStatus.Text.';
const I18N_CANCELLATION_PATH = 'components.modals.CancellationReason.Text.';

export const WorkOrderUpdateStatus: React.FC = observer(() => {
  const { t } = useTranslation();
  const { workOrdersStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [invalidIds, setInvalidIds] = useState<number | number[] | null>(null);

  const cancellationReasonOptions = useMemo(() => {
    return Object.values(CancellationReason).map(value => ({
      label: t(`${I18N_CANCELLATION_PATH}${value}`),
      value,
    }));
  }, [t]);

  const request = useCallback(
    async (values: typeof defaultValues, showModal = false) => {
      const invalid = await workOrdersStore.workOrdersBulkStatusChange(values);

      workOrdersStore.isOpenedUpdateStatusModal && workOrdersStore.toggleUpdateStatusModal();

      if (!invalid) {
        workOrdersStore.clearWorkOrdersSelects();

        await workOrdersStore.getWorkOrdersList(
          businessUnitId,
          {
            assignedRoute: workOrdersStore.assignedRoute,
            businessLineIds: workOrdersStore.businessLineIds,
            serviceAreaIds: workOrdersStore.serviceAreaIds,
            status: workOrdersStore.status,
          },
          {
            cleanUp: true,
            resetOffset: true,
          },
        );

        return;
      }

      showModal && setInvalidIds(invalid);
    },
    [workOrdersStore, businessUnitId],
  );

  const onSubmit = useCallback(
    async (values: typeof defaultValues) => {
      await request(values, true);
    },
    [request],
  );

  const formik = useFormik({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: validationSchema(t),
    onSubmit,
  });

  const { values, errors, setFieldValue, submitForm, resetForm } = formik;

  const clearInvalidIds = useCallback(() => {
    setInvalidIds(null);
    resetForm();
    workOrdersStore.closeUpdateStatusModals();
  }, [workOrdersStore, resetForm]);

  const handleSubmitSecondTime = useCallback(async () => {
    if (workOrdersStore.workOrdersSelects.size) {
      await request(values);
    }

    clearInvalidIds();
  }, [values, workOrdersStore, clearInvalidIds, request]);

  return (
    <>
      <Button
        variant="primary"
        disabled={workOrdersStore.isWorkOrdersSelectsEmpty}
        onClick={workOrdersStore.toggleUpdateStatusModal.bind(this)}
      >
        {t(`${I18N_PATH}UpdateStatus`)}
      </Button>
      <Modal isOpen={workOrdersStore.isOpenedUpdateStatusModal}>
        <FormContainer formik={formik}>
          <Layouts.Flex direction="column">
            <Layouts.Padding top="3" right="5" left="5">
              <Typography variant="headerThree">
                {t(`${I18N_PATH}Title`, {
                  count: workOrdersStore.workOrdersSelectsSize,
                })}
              </Typography>
            </Layouts.Padding>
            <Layouts.Padding left="5" right="5" bottom="2" top="3">
              <StatusesSelect
                routeType="work-orders"
                name="status"
                placeholder={t(`${I18N_PATH}StatusPlaceholder`)}
                value={values.status}
                onSelectChange={async (name, value) => {
                  await setFieldValue(name, value);
                  if (value !== WorkOrderStatus.CANCELED) {
                    await setFieldValue('cancellationReason', undefined);
                    await setFieldValue('cancellationComment', undefined);
                  }
                }}
                statuses={availableWorkOrdersStatuses}
                label={t(`${I18N_PATH}StatusLabel`)}
                error={errors.status}
              />
              {values.status === WorkOrderStatus.CANCELED && (
                <Select
                  name="cancellationReason"
                  value={values.cancellationReason}
                  placeholder={t(`${I18N_PATH}ReasonPlaceholder`)}
                  options={cancellationReasonOptions}
                  onSelectChange={setFieldValue}
                  label={t(`${I18N_PATH}ReasonLabel`)}
                  error={errors.cancellationReason}
                />
              )}
              {values.cancellationReason === CancellationReason.Other && (
                <TextInput
                  name="cancellationComment"
                  placeholder={t(`${I18N_PATH}CommentPlaceholder`)}
                  onChange={async e => {
                    await setFieldValue('cancellationComment', e.target.value);
                  }}
                  value={values.cancellationComment}
                  area
                  label={t(`${I18N_PATH}CommentLabel`)}
                  error={errors.cancellationComment}
                />
              )}
            </Layouts.Padding>
            <Divider />
            <Layouts.Padding top="3" bottom="3" left="5" right="5">
              <Layouts.Flex justifyContent="space-between">
                <Button onClick={workOrdersStore.toggleUpdateStatusModal.bind(this)}>
                  {t(`${I18N_ROOT_PATH}Cancel`)}
                </Button>
                <Button variant="primary" onClick={submitForm}>
                  {t(`${I18N_ROOT_PATH}ConfirmChanges`)}
                </Button>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Flex>
        </FormContainer>
      </Modal>
      <UnableToEditWO ids={invalidIds} onContinue={handleSubmitSecondTime} />
    </>
  );
});
