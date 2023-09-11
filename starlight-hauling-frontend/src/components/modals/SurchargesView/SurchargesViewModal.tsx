import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import styles from '../SurchargesCalculation/css/styles.scss';
import SurchargeItems from './SurchargeItems';
import { ISurchargesOrder, ISurchargesOrderData, ISurchargesViewModal } from './types';

const I18N_PATH = 'components.modals.SurchargesCalculation.Text.';

const SurchargesViewModal: React.FC<ISurchargesViewModal> = ({
  surchargesData,
  centered,
  ...modalProps
}) => {
  const { surchargeStore } = useStores();
  const { t } = useTranslation();

  const activeSurcharges = surchargeStore.values?.filter(({ active }) => active) ?? [];

  const orderSurcharges = surchargesData.orderSurcharges.reduce(
    (acc: ISurchargesOrder[], surchargeData: ISurchargesOrderData) => {
      const currentSurcharge = activeSurcharges.find(
        surcharge => surcharge.id === surchargeData.id,
      );

      if (currentSurcharge) {
        const { calculation, description } = currentSurcharge;

        return [
          ...acc,
          {
            id: surchargeData.surchargeId,
            description,
            calculation,
            billableItemDescription: surchargeData?.billableService?.description,
            materialDescription: surchargeData.material.description,
            flatPrice: surchargeData.material.price,
            billableItemPrice: surchargeData.globalRatesSurcharge.price,
            amount: surchargeData.amount,
          },
        ];
      }

      return acc;
    },
    [],
  );

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
        <SurchargeItems orderSurcharges={orderSurcharges} total={surchargesData.surchargesTotal} />
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

export default observer(SurchargesViewModal);
