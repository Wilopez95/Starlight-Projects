import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { BillableOrderService } from '@root/api';
import { Typography } from '@root/common';
import { useStores } from '@root/hooks';

import {
  InformationSection,
  JobSiteSection,
  PaymentSection,
  ServicesSection,
  SummarySection,
} from './sections';
import { FormContainerLayout } from './styles';

const I18N_PATH = 'quickViews.OrderDetailsView.Text.';

const orderService = new BillableOrderService();

const CustomerOrderDetailsRightPanel: React.FC = () => {
  const { orderStore, lineItemStore, materialStore } = useStores();

  const { t } = useTranslation();
  const currentOrder = orderStore.selectedEntity!;

  const businessLineId = currentOrder?.businessLine.id.toString();

  const initialValues = useMemo(() => {
    if (currentOrder) {
      return { ...currentOrder };
    }

    return {};
  }, [currentOrder]);

  const formik = useFormik({
    initialValues,
    initialErrors: {},
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: noop,
  });

  const { setFieldValue } = formik;

  useEffect(() => {
    lineItemStore.request({ businessLineId });
    materialStore.request({ businessLineId });
  }, [lineItemStore, businessLineId, materialStore]);

  useEffect(() => {
    (async () => {
      try {
        const response = await orderService.getOrderReceiptAttachments({
          orderId: currentOrder.id,
        });

        if (response?.order) {
          setFieldValue(
            'receipts',
            response.order.payments.filter(payment => payment.receiptPdfUrl),
          );
        }
      } catch {
        setFieldValue('receipts', []);
      }
    })();
  }, [currentOrder.id, setFieldValue]);

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerTwo">
          <Layouts.Padding top="2" bottom="2">
            {t(`${I18N_PATH}OrderN`, { id: currentOrder.id })}
          </Layouts.Padding>
        </Typography>
        <FormContainerLayout formik={formik}>
          <InformationSection recyclingWONumber={currentOrder.recyclingWONumber} />
          <ServicesSection />
          <PaymentSection />
          <SummarySection />
          <JobSiteSection />
        </FormContainerLayout>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(CustomerOrderDetailsRightPanel);
