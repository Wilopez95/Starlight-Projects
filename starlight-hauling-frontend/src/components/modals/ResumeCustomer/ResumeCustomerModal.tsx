import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Layouts } from '@starlightpro/shared-components';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useToggle } from '@root/hooks';

import { IResumeCustomerModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.modals.ResumeCustomer.Text.';
const ResumeCustomerModal: React.FC<IResumeCustomerModal> = ({ isOpen, onSubmit, onCancel }) => {
  const [shouldResumeTemplates, toggleResumeServices] = useToggle(true);
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onClose={onCancel}
    >
      <Layouts.Padding padding="4">
        <Layouts.Margin bottom="4">
          <Typography variant="headerTwo">{t(`${I18N_PATH}ResumeCustomer`)}</Typography>
        </Layouts.Margin>
        <Typography variant="bodyMedium">{t(`${I18N_PATH}ResumeMessage`)}</Typography>
        <Layouts.Margin top="2">
          <Checkbox
            name="shouldResumeTemplates"
            value={shouldResumeTemplates}
            onChange={toggleResumeServices}
          >
            {t(`${I18N_PATH}ResumeServices`)}
          </Checkbox>
        </Layouts.Margin>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding padding="4">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onCancel}>{t('Text.Cancel')}</Button>
          <Button onClick={() => onSubmit(shouldResumeTemplates)} variant="primary">
            {t(`${I18N_PATH}ResumeCustomer`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};

export default ResumeCustomerModal;
