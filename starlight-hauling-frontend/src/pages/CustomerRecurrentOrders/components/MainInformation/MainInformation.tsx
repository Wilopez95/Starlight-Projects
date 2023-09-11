import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { RecurrentOrderStatus } from '@root/types';

import {
  InformationSection,
  JobSiteSection,
  PaymentSection,
  ServicesSection,
  SummarySection,
} from './sections';
import * as Styles from './styles';

const I18N_PATH = 'pages.CustomerRecurrentOrders.tables.MainInformation.Text.';

const RecurrentOrderMainInformationView: React.FC = () => {
  const { recurrentOrderStore, lineItemStore } = useStores();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { businessUnitId } = useBusinessContext();

  const currentOrder = recurrentOrderStore.selectedEntity;

  const businessLineId = currentOrder?.businessLine.id.toString();

  const formik = useFormik({
    initialValues: { ...currentOrder },
    initialErrors: {},
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: noop,
  });

  useEffect(() => {
    if (id) {
      recurrentOrderStore.requestById(+id);
    }
  }, [id, recurrentOrderStore]);

  useEffect(() => {
    if (businessLineId) {
      lineItemStore.request({ businessLineId });
    }
  }, [lineItemStore, businessLineId]);

  const handlePutOnHold = useCallback(() => {
    recurrentOrderStore.putOnHold(+id);
  }, [id, recurrentOrderStore]);

  const handlePutUnHold = useCallback(() => {
    recurrentOrderStore.putOffHold(+id);
  }, [id, recurrentOrderStore]);

  const handleClose = useCallback(() => {
    recurrentOrderStore.close(+id);
  }, [id, recurrentOrderStore]);

  const editOrderLink = useMemo(() => {
    return pathToUrl(Paths.RequestModule.Order.Edit, {
      businessUnit: businessUnitId,
      orderId: id,
    });
  }, [businessUnitId, id]);

  if (!currentOrder) {
    return null;
  }

  return (
    <>
      <Layouts.Box position="relative" overflowHidden>
        <Layouts.Scroll>
          <Layouts.Padding padding="3">
            <Styles.FormContainerLayout formik={formik}>
              <InformationSection />
              <ServicesSection />
              <PaymentSection />
              <SummarySection />
              <JobSiteSection />
            </Styles.FormContainerLayout>
          </Layouts.Padding>
        </Layouts.Scroll>
      </Layouts.Box>
      <Divider />
      <Layouts.Padding padding="3">
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Flex>
            {currentOrder.status !== RecurrentOrderStatus.closed ? (
              <Protected permissions="orders:end-recurrent:perform">
                <Layouts.Margin right="2">
                  <Button onClick={handleClose} variant="converseAlert">
                    {t(`${I18N_PATH}EndRecurring`)}
                  </Button>
                </Layouts.Margin>
              </Protected>
            ) : null}
            <Protected permissions="orders:hold-recurrent:perform">
              {currentOrder.status === RecurrentOrderStatus.active ? (
                <Button onClick={handlePutOnHold}>{t(`${I18N_PATH}PutOnHold`)}</Button>
              ) : null}
              {currentOrder.status === RecurrentOrderStatus.onHold ? (
                <Button onClick={handlePutUnHold}>{t(`${I18N_PATH}PutUnHold`)}</Button>
              ) : null}
            </Protected>
          </Layouts.Flex>
          {currentOrder.status !== RecurrentOrderStatus.closed ? (
            <Button variant="primary" to={editOrderLink}>
              {t(`${I18N_PATH}EditRecurrentOrder`)}
            </Button>
          ) : null}
        </Layouts.Flex>
      </Layouts.Padding>
    </>
  );
};

export default observer(RecurrentOrderMainInformationView);
