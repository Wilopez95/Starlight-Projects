import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';

import { IDeleteMediaFileModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.Gallery.components.DeleteMediaFileModal.DeleteMediaFileModal.Text.';

const DeleteMediaFileModal: React.FC<IDeleteMediaFileModal> = ({ isOpen, onCancel, onSubmit }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} className={styles.modal} onClose={onCancel}>
      <Layouts.Padding padding="4" bottom="5">
        <Typography color="secondary" variant="headerThree">
          {t(`${I18N_PATH}DeleteFile`)}
        </Typography>
        <Layouts.Margin top="2">
          <Typography variant="bodyMedium" shade="dark">
            {t(`${I18N_PATH}DeleteConfirmation`)}
          </Typography>
        </Layouts.Margin>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding padding="3" left="4" right="4">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onCancel}>{t('Text.Cancel')}</Button>
          <Button onClick={onSubmit} variant="alert">
            {t('Text.Delete')}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};

export default DeleteMediaFileModal;
