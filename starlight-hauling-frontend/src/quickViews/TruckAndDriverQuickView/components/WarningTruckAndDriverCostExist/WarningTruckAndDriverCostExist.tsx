import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { Modal, Typography } from '@root/common';
import { IModal } from '@root/common/Modal/types';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.';

interface IWarningModal extends IModal {
  handleUpdate(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const WarningTruckAndDriverCostExist: React.FC<IWarningModal> = ({
  isOpen,
  onClose,
  handleUpdate,
}) => {
  const { t } = useTranslation();
  const { truckAndDriverCostStore } = useStores();

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      onClose?.();
      truckAndDriverCostStore.toggleQuickView();
    },
    [truckAndDriverCostStore, onClose],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding padding="4" bottom="3">
        <Typography variant="headerThree" color="alert">
          {t(`${I18N_PATH}Text.UpdateData`)}
        </Typography>
        <Layouts.Padding top="2">
          <Typography variant="bodyMedium">{t(`${I18N_PATH}Text.ThereAreExistingData`)}</Typography>
        </Layouts.Padding>
      </Layouts.Padding>
      <Divider top bottom />
      <Layouts.Padding left="4" right="4" bottom="3">
        <Layouts.Box as={Layouts.Flex} justifyContent="space-between">
          <Button onClick={handleClose}>{t('Text.KeepExistingData')}</Button>
          <Button onClick={handleUpdate} variant="alert">
            {t('Text.Update')}
          </Button>
        </Layouts.Box>
      </Layouts.Padding>
    </Modal>
  );
};

export default WarningTruckAndDriverCostExist;
