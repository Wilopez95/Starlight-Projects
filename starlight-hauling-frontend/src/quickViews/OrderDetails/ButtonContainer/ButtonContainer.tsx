import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, MAX_FILE_SIZE } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Loader, Protected, Typography, useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { BusinessLineType } from '@root/consts';
import { getCurrentOrderTotal, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBoolean, usePermission, useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableOrder } from '@root/types';

import { getData } from '../../helpers/orderFormikData';
import { IOrderDetailsComponent } from '../types';

import { getButtons } from './Buttons';

import styles from './css/styles.scss';

const ButtonContainer: React.FC<IOrderDetailsComponent> = ({ shouldRemoveOrderFromStore }) => {
  const { orderStore, surchargeStore, i18nStore } = useStores();
  const { dateFormat } = useIntl();
  const { forceCloseQuickView } = useQuickViewContext();

  const [loading, setLoading] = useState(false);
  const { format } = useTimeZone();
  const { t } = useTranslation();
  const { values, validateForm, setFieldValue, setValues } = useFormikContext<IConfigurableOrder>();

  const order = orderStore.selectedEntity!;
  const [isOverrideModalOpen, showOverrideModal, hideOverrideModal] = useBoolean();
  const submitCallback = useRef<(data: IConfigurableOrder) => Promise<void>>();

  const canUnlockOverrides = usePermission('orders:unlock-overrides:perform');

  const handleSyncWithDispatch = useCallback(async () => {
    setLoading(true);
    const maybeSyncedOrder = await orderStore.syncWithDispatch(order, forceCloseQuickView);

    setLoading(false);

    if (maybeSyncedOrder) {
      const data = getData(maybeSyncedOrder);

      setValues(data);
    }
  }, [forceCloseQuickView, order, orderStore, setValues]);

  const handleOverrideCancel = useCallback(() => {
    hideOverrideModal();
    orderStore.cleanPaymentError();
  }, [orderStore, hideOverrideModal]);

  const handleOverrideConfirm = useCallback(async () => {
    handleOverrideCancel();
    const { newOrderTotal } = getCurrentOrderTotal({
      values,
      region: i18nStore.region,
      surcharges: surchargeStore.values,
      commercialTaxesUsed: order.commercialTaxesUsed,
    });

    if (submitCallback.current) {
      await submitCallback.current({
        ...values,
        grandTotal: newOrderTotal,
        overrideCreditLimit: true,
      });
    }
    forceCloseQuickView();
  }, [
    handleOverrideCancel,
    values,
    i18nStore.region,
    surchargeStore.values,
    order.commercialTaxesUsed,
    forceCloseQuickView,
  ]);

  const handleSubmit = async (callback: (data: IConfigurableOrder) => Promise<void>) => {
    const errors = await validateForm();

    const totalFilesSize: number =
      values.workOrder?.mediaFiles
        .filter(file => file instanceof File)
        .reduce((total, file) => total + (file as File).size, 0) ?? 0;

    if (!isEmpty(errors)) {
      if (!values.unlockOverrides && canUnlockOverrides) {
        setFieldValue('unlockOverrides', true);
      }

      return;
    }

    if (totalFilesSize > MAX_FILE_SIZE) {
      NotificationHelper.error('images', ActionCode.FILE_TOO_LARGE);

      return;
    }

    const { newOrderTotal } = getCurrentOrderTotal({
      values,
      region: i18nStore.region,
      surcharges: surchargeStore.values,
      commercialTaxesUsed: order.commercialTaxesUsed,
    });

    await callback({ ...values, grandTotal: newOrderTotal });
    if (orderStore.paymentError && order.customer?.onAccount) {
      submitCallback.current = callback;
      showOverrideModal();
    } else {
      forceCloseQuickView();
    }
  };

  const isPortableToilets = order.businessLine.type === BusinessLineType.portableToilets;
  const syncDate = values.workOrder?.syncDate;

  const ButtonsComponent = getButtons(order.status);

  return (
    <>
      <Protected
        permissions="orders:override-credit-limit:perform"
        fallback={
          <ConfirmModal
            isOpen={isOverrideModalOpen}
            cancelButton="Edit Order"
            title={t(`Titles.CreditOverlimit`)}
            subTitle="Looks like order total exceeded available credit limit. You have insufficient privileges to update this order."
            onCancel={handleOverrideCancel}
            nonDestructive
          />
        }
      >
        <ConfirmModal
          isOpen={isOverrideModalOpen}
          cancelButton="Edit Order"
          submitButton={t(`Text.OverrideLimit`)}
          title={t(`Titles.CreditOverlimit`)}
          subTitle="Looks like order total exceeded available credit limit. Are you sure want to place this order and exceed the limit?"
          onCancel={handleOverrideCancel}
          onSubmit={handleOverrideConfirm}
          nonDestructive
        />
      </Protected>
      <Layouts.Flex justifyContent="space-between" alignItems="center">
        <Layouts.Flex alignItems="center">
          {values.workOrder?.id && !isPortableToilets ? (
            <>
              <Button onClick={handleSyncWithDispatch}>↑↓ Sync with Dispatch</Button>
              {syncDate || (!syncDate && loading) ? (
                <Layouts.Margin left="3" right="2">
                  <Loader className={styles.syncIcon} active={loading} />
                </Layouts.Margin>
              ) : null}
              {syncDate ? (
                <Typography color="secondary">
                  {`Updated ${format(syncDate, dateFormat.date)} at ${format(
                    syncDate,
                    dateFormat.time,
                  )}`}
                </Typography>
              ) : null}
            </>
          ) : null}
        </Layouts.Flex>
        <Layouts.Flex alignItems="center">
          {ButtonsComponent ? (
            <ButtonsComponent
              onSubmit={handleSubmit}
              shouldRemoveOrderFromStore={shouldRemoveOrderFromStore}
            />
          ) : null}
        </Layouts.Flex>
      </Layouts.Flex>
    </>
  );
};

export default observer(ButtonContainer);
