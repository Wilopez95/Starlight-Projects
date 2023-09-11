import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CrossIcon, Layouts, Modal, Typography } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools';

import { IOverrideChangesModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH =
  'modules.pricing.CustomRate.components.CustomRateBulkEditQuickView.tabs.components.OverrideChangesModal.Text.';

export const OverrideChangesModal: React.FC<IOverrideChangesModal> = ({
  isOpened,
  closeBulkUpdate,
  setIsOpened,
  onBulkUpdate,
}) => {
  const { t } = useTranslation();

  const handleCancel = useCallback(() => {
    setIsOpened(false);
  }, [setIsOpened]);

  const handleOverride = useCallback(() => {
    onBulkUpdate(true);
    setIsOpened(false);
    closeBulkUpdate();
  }, [closeBulkUpdate, onBulkUpdate, setIsOpened]);

  const handleCancelOverride = useCallback(() => {
    setIsOpened(false);
    closeBulkUpdate();
  }, [closeBulkUpdate, setIsOpened]);

  return (
    <Modal className={styles.modal} isOpen={isOpened}>
      <Layouts.Box position="absolute" right="0" top="0">
        <Layouts.Margin margin="1">
          <CrossIcon role="button" aria-label={t('Text.Close')} onClick={handleCancel} />
        </Layouts.Margin>
      </Layouts.Box>
      <Layouts.Padding padding="4">
        <Layouts.Padding bottom="1">
          <Typography variant="headerThree" textTransform="capitalize" textAlign="left">
            {t(`${I18N_PATH}OverridePreviousChanges`)}
          </Typography>
        </Layouts.Padding>
        <Typography variant="bodyMedium">
          {t(`${I18N_PATH}DoYouWantToOverrideBulkRates`)}
        </Typography>
      </Layouts.Padding>
      <Layouts.Padding top="1" bottom="2">
        <Divider />
      </Layouts.Padding>
      <Layouts.Padding left="3" right="3">
        <Layouts.Flex justifyContent="space-around">
          <Button onClick={handleCancelOverride}>{t('Text.Cancel')}</Button>
          <Button onClick={handleOverride} variant="primary">
            {t(`${I18N_PATH}OverrideChanges`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};
