import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { useFormik } from 'formik';

import { IUpdateWorkOrderParams } from '@root/api';
import { Divider } from '@root/common/TableTools';
import { DateFormat } from '@root/consts';
import { WorkOrderStatus } from '@root/consts/workOrder';
import { useStores } from '@root/hooks';
import { QuickViewHeaderTitle } from '@root/quickViews';
import { CancellationReason as CancellationReasonEnum } from '@root/types';
import { CancellationReason } from '@root/widgets/modals';

import { FormBase } from './FormBase';
import { FormDataType, getInitialValues } from './formikData';
import { IForm } from './types';

const I18N_PATH_WO_EDIT = 'quickViews.WorkOrderEdit.Text.';
const I18N_PATH_ROOT = 'Text.';

const getNormalizedData = (workOrderId: number, values: FormDataType) => {
  const { cancellationReason, cancellationComment, status, serviceDate, ...restValues } = values;
  const normalizedData: IUpdateWorkOrderParams = {
    id: workOrderId,
    status,
    serviceDate: format(new Date(serviceDate), DateFormat.DateSerialized),
  };

  if (values.status === WorkOrderStatus.CANCELED) {
    normalizedData.cancellationReason = cancellationReason;

    if (values.cancellationReason === CancellationReasonEnum.Other) {
      normalizedData.cancellationComment = cancellationComment;
    }
  }

  return {
    ...restValues,
    ...normalizedData,
  } as IUpdateWorkOrderParams;
};

export const Form: React.FC<IForm> = ({ scrollContainerHeight, workOrder, onAddRef, onClose }) => {
  const { workOrdersStore } = useStores();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onFormSubmit = useCallback(
    async (values: FormDataType) => {
      const normalizedData = getNormalizedData(workOrder.id, values);

      const result = await workOrdersStore.updateWorkOrder(normalizedData, workOrder);

      onClose(result);
    },
    [workOrder, workOrdersStore, onClose],
  );

  const formik = useFormik({
    initialValues: getInitialValues(workOrder),
    onSubmit: onFormSubmit,
    enableReinitialize: true,
  });

  const { resetForm, handleSubmit, setFieldValue } = formik;

  const onCancel = () => {
    resetForm();
    onClose();
  };

  const handleModalSubmit = useCallback(
    (cancellationReason: CancellationReasonEnum, cancellationComment?: string) => {
      setFieldValue('status', WorkOrderStatus.CANCELED);
      setFieldValue('cancellationReason', cancellationReason);
      setFieldValue('cancellationComment', cancellationComment);

      setIsOpen(false);
    },
    [setFieldValue, setIsOpen],
  );

  const handleModalClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Layouts.Box position="relative" ref={onAddRef}>
        <Layouts.Padding left="3" right="3">
          <QuickViewHeaderTitle name={workOrder.displayId} showPreview={false}>
            {t(`${I18N_PATH_WO_EDIT}Title`)}
            {workOrder.displayId}
          </QuickViewHeaderTitle>
        </Layouts.Padding>
      </Layouts.Box>
      <Layouts.Scroll height={scrollContainerHeight}>
        <FormContainer formik={formik}>
          <Layouts.Padding left="3" right="3" bottom="3" top="2">
            <FormBase workOrder={workOrder} setCancellationReasonModalOpen={setIsOpen} />
          </Layouts.Padding>
        </FormContainer>
      </Layouts.Scroll>
      <Layouts.Box position="relative" ref={onAddRef}>
        <Divider />
        <Layouts.Padding top="2" bottom="2" left="3" right="3">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={onCancel}>
              {t(`${I18N_PATH_ROOT}Cancel`)}
            </Button>
            <Button variant="primary" type="submit" onClick={() => handleSubmit()}>
              {t(`${I18N_PATH_ROOT}SaveChanges`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
      <CancellationReason
        isOpen={isOpen}
        cancellationReason={workOrder.cancellationReason}
        cancellationComment={workOrder.cancellationComment}
        onSubmit={handleModalSubmit}
        onClose={handleModalClose}
      />
    </>
  );
};
