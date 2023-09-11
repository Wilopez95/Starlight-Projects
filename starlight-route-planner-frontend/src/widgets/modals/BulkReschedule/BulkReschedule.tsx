import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Layouts, Typography } from '@starlightpro/shared-components';
import { format, isSameDay, startOfTomorrow } from 'date-fns';
import { useFormik } from 'formik';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/common/TableTools';
import { DateFormat } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { IWorkOrdersBulkReschedule } from '@root/stores/workOrder/types';
import { CalendarAdapter as Calendar } from '@root/widgets/CalendarAdapter/Calendar';

import { UnableToEditWO } from '../UnableToEditWO';

import { validationSchema } from './formikData';
import { Modal } from './styles';

const I18N_PATH = 'components.modals.BulkReschedule.Text.';

export const BulkReschedule: React.FC = observer(() => {
  const { t } = useTranslation();
  const { workOrdersStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [invalidIds, setInvalidIds] = useState<number | number[] | null>(null);

  const request = useCallback(
    async (values: Omit<IWorkOrdersBulkReschedule, 'ids'>, showModal = false) => {
      const invalid = await workOrdersStore.workOrdersBulkReschedule(values);

      workOrdersStore.isOpenedRescheduleModal && workOrdersStore.toggleRescheduleModal();

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
    (values: Omit<IWorkOrdersBulkReschedule, 'ids'>) => {
      request(values, true);
    },
    [request],
  );

  const validateServiceDate = useCallback(
    value =>
      typeof value === 'string' &&
      !isSameDay(new Date(workOrdersStore.serviceDate), new Date(value)),
    [workOrdersStore.serviceDate],
  );

  const formik = useFormik({
    initialValues: {
      serviceDate: format(new Date(startOfTomorrow()), DateFormat.DateSerialized),
    },
    validationSchema: validationSchema(validateServiceDate, t),
    onSubmit,
  });

  const { values, errors, handleSubmit, setFieldValue, resetForm } = formik;

  const clearInvalidIds = useCallback(() => {
    setInvalidIds(null);
    resetForm();
    workOrdersStore.closeRescheduleModals();
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
        onClick={workOrdersStore.toggleRescheduleModal.bind(this)}
        disabled={workOrdersStore.isWorkOrdersSelectsEmpty}
      >
        {t(`${I18N_PATH}Reschedule`)}
      </Button>
      <Modal isOpen={workOrdersStore.isOpenedRescheduleModal}>
        <Layouts.Padding right="4" top="4" left="4">
          <Typography variant="headerTwo">
            {t(`${I18N_PATH}RescheduleModalTitle`, {
              count: workOrdersStore.workOrdersSelectsSize,
            })}
          </Typography>
          <Layouts.Padding top="2" bottom="1">
            <Banner color="primary" showIcon>
              <Typography variant="bodyMedium" fontWeight="medium" color="primary">
                {t(`${I18N_PATH}RescheduleModalAlert`)}
              </Typography>
            </Banner>
          </Layouts.Padding>
          <Layouts.Padding top="2">
            <Layouts.Flex direction="row" $wrap={false} justifyContent="flex-start">
              <Layouts.Padding>
                <Calendar
                  label={t(`${I18N_PATH}CurrentServiceDate`)}
                  name="currentServiceDate"
                  value={workOrdersStore.serviceDate}
                  onDateChange={noop}
                  withInput
                  readOnly
                />
              </Layouts.Padding>
              <Layouts.Padding left="2">
                <Calendar
                  label={t(`${I18N_PATH}NewServiceDate`)}
                  name="serviceDate"
                  withInput
                  value={new Date(values.serviceDate)}
                  onDateChange={setFieldValue}
                  error={errors.serviceDate}
                />
              </Layouts.Padding>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Padding>
        <Divider />
        <Layouts.Padding padding="4">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={workOrdersStore.toggleRescheduleModal.bind(this)}>
              {t(`Text.Cancel`)}
            </Button>
            <Button onClick={() => handleSubmit()} variant="primary" type="submit">
              {t(`${I18N_PATH}RescheduleOrders`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Modal>
      <UnableToEditWO ids={invalidIds} onContinue={handleSubmitSecondTime} />
    </>
  );
});
