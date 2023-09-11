import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Modal } from '../../../Modal/Modal';
import { Typography } from '../../../Typography/Typography';
import { Divider } from '../../TableDivider/index';

import { IUnsavedChangesModal } from './type';

import styles from './css/styles.scss';

const I18N_PATH = 'common.TableTools.TableQuickView.UnsavedChanges.Text.';

export const UnsavedChangesModal: React.FC<IUnsavedChangesModal> = ({
  text,
  isOpen,
  onCancel,
  onSubmit,
  overlayClassName,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      className={cx(className, styles.modal)}
      overlayClassName={cx(overlayClassName, styles.overlay)}
    >
      <Typography className={styles.title}>
        {text ?? t(`${I18N_PATH}YouHaveUnsavedChanges`)}
      </Typography>
      <Divider />
      <div className={styles.buttonContainer}>
        <Button onClick={onCancel}>{t('Text.DoNotSave')}</Button>
        <Button onClick={onSubmit} variant="primary">
          {t('Text.SaveChanges')}
        </Button>
      </div>
    </Modal>
  );
};
