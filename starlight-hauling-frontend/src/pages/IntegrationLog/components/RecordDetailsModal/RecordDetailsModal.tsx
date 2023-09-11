import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { Modal, Typography } from '@root/common';
import { IModal } from '@root/common/Modal/types';
import { Divider } from '@root/common/TableTools';
import { type IQbIntegrationLog } from '@root/types';

import styles from './css/styles.scss';

interface IRecordDetailsModal extends IModal {
  entry: IQbIntegrationLog;
}

const I18N_PATH = 'pages.SystemConfiguration.tables.AuditLog.components.RecordDetailsModal.Text.';

const RecordDetailsModal: React.FC<IRecordDetailsModal> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding top="3" right="5" left="5" bottom="2">
        <Layouts.Flex direction="column">
          <Typography variant="headerThree">{t(`${I18N_PATH}Title`)}</Typography>
          <Typography variant="bodyMedium" color="grey" shade="dark" />
        </Layouts.Flex>
      </Layouts.Padding>
      <Divider bottom />
      <Layouts.Flex direction="column" flexGrow={1} className={styles.scrollContainer}>
        <Layouts.Padding left="5" right="5" />
      </Layouts.Flex>
      <Layouts.Flex direction="column">
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="flex-end">
            <Button variant="primary" onClick={onClose}>
              {t('Text.Close')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </Modal>
  );
};

export default RecordDetailsModal;
