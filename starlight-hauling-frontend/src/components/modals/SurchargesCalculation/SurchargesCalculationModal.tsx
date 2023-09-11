import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import {
  calcDetailsOrderSurcharges,
  calcNewOrderSurcharges,
  calcOrderSurcharges,
  IOrderViewSurcharge,
} from '@root/helpers';
import { useStores } from '@root/hooks';

import styles from '../SurchargesCalculation/css/styles.scss';
import SurchargeItems from './SurchargeItems';
import { ISurchargeModal } from './types';

const I18N_PATH = 'components.modals.SurchargesCalculation.Text.';

const SurchargesCalculationModal: React.FC<ISurchargeModal> = ({
  detailsOrder,
  editOrder,
  orders,
  centered,
  RecurrentOrder,
  ...modalProps
}) => {
  const { surchargeStore } = useStores();

  const { t } = useTranslation();

  let orderSurcharges: IOrderViewSurcharge[] = [],
    orderSurchargesTotal = 0,
    billableServiceId;

  const isNewOrder = !!orders;
  //const isRecurrentOrder = !!RecurrentOrder;

  if (detailsOrder) {
    ({ orderSurcharges, orderSurchargesTotal } = calcDetailsOrderSurcharges({
      order: detailsOrder,
    }));
    billableServiceId = detailsOrder?.billableService?.originalId;
  } else if (editOrder) {
    ({ orderSurcharges, orderSurchargesTotal } = calcOrderSurcharges({
      order: editOrder,
      surcharges: surchargeStore.values,
    }));
    billableServiceId = editOrder?.billableService?.originalId;
  }

  const displayModalRow = () => {
    const JSXresult = [];

    if (orders) {
      orders.forEach((order, orderIndex: number) => {
        const { orderSurcharges: orderNewSurcharges, orderSurchargesTotal: newSurchargesTotal } =
          calcNewOrderSurcharges({ newOrder: order, surcharges: surchargeStore.values });

        if (newSurchargesTotal > 0) {
          JSXresult.push(
            <React.Fragment key={orderIndex}>
              {orders.length > 1 || RecurrentOrder ? (
                <Layouts.Padding padding="4" top="1" bottom="1">
                  <Typography variant="headerFour">
                    {t(`${I18N_PATH}OrderN`, { id: orderIndex + 1 })}
                  </Typography>
                </Layouts.Padding>
              ) : null}
              <SurchargeItems
                orderSurcharges={orderNewSurcharges}
                billableServiceId={order.billableServiceId}
                total={newSurchargesTotal * (order.billableServiceQuantity ?? 1)}
                billableServiceQuantity={order.billableServiceQuantity}
              />
            </React.Fragment>,
          );
        }
      });
    }
    if (RecurrentOrder) {
      const { orderSurcharges: orderNewSurcharges, orderSurchargesTotal: newSurchargesTotal } =
        calcNewOrderSurcharges({ newOrder: RecurrentOrder, surcharges: surchargeStore.values });
      const index = orders ? orders.length : 0;

      if (newSurchargesTotal > 0) {
        JSXresult.push(
          <React.Fragment key={index}>
            {index > 0 ? (
              <Layouts.Padding padding="4" top="1" bottom="1">
                <Typography variant="headerFour">
                  {t(`${I18N_PATH}OrderN`, { id: index + 1 })}
                </Typography>
              </Layouts.Padding>
            ) : null}
            <SurchargeItems
              orderSurcharges={orderNewSurcharges}
              billableServiceId={RecurrentOrder.billableServiceId}
              total={newSurchargesTotal * (RecurrentOrder.billableServiceQuantity ?? 1)}
              billableServiceQuantity={RecurrentOrder.billableServiceQuantity}
            />
          </React.Fragment>,
        );
      }
    }

    return JSXresult;
  };

  return (
    <Modal
      {...modalProps}
      className={styles.modal}
      overlayClassName={cx(styles.overlay, centered && styles.centered)}
    >
      <Layouts.Padding padding="3" right="4" left="4">
        <Typography variant="headerThree">{t(`${I18N_PATH}AppliedSurcharges`)}</Typography>
      </Layouts.Padding>
      <Divider />
      <Layouts.Scroll rounded overscrollBehavior="contain">
        {isNewOrder ? (
          displayModalRow()
        ) : (
          <SurchargeItems
            orderSurcharges={orderSurcharges}
            billableServiceId={billableServiceId}
            total={orderSurchargesTotal}
          />
        )}
      </Layouts.Scroll>
      <Divider />
      <div className={styles.controls}>
        <Button variant="primary" onClick={modalProps.onClose}>
          {t(`Text.Close`)}
        </Button>
      </div>
    </Modal>
  );
};

export default observer(SurchargesCalculationModal);
