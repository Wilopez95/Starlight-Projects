import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';

import { Modal } from '@root/common';
import { Divider } from '@root/common/TableTools';

import { type ITaxDescriptionConfirm } from './types';

import styles from './css/styles.scss';

const I18N_PATH =
  'pages.SystemConfiguration.tables.TaxDistricts.QuickView.TaxRates.TaxDescriptionConfirm.Text.';

const TaxDescriptionConfirm: React.FC<ITaxDescriptionConfirm> = ({
  isOpen,
  onClose,
  taxDescriptionDirty,
  onTaxRatesSave,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <h2 className={styles.title}>
        You have unsaved changes
        {taxDescriptionDirty ? t(`${I18N_PATH}DoYouWantToSaveChanges`) : null}
      </h2>
      <Divider />
      <div className={styles.buttonContainer}>
        <Button onClick={onClose}>Cancel</Button>
        <div>
          {taxDescriptionDirty ? (
            <Button variant="primary" onClick={() => onTaxRatesSave(false)}>
              {t(`${I18N_PATH}SaveTaxesOnly`)}
            </Button>
          ) : null}
          <Button variant="primary" onClick={() => onTaxRatesSave(taxDescriptionDirty)}>
            {t(`${I18N_PATH}SaveChanges`)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaxDescriptionConfirm;
