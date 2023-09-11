import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { type INeedsApprovalOrApprovedStatus } from '@root/types';

import { type IChangeSubscriptionOrdersStatusModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.OrderTable.modals.ChangeStatusModal.Text.';

const actions: Record<INeedsApprovalOrApprovedStatus, string> = {
  APPROVED: 'finalize',
  NEEDS_APPROVAL: 'approve',
};

const ChangeSubscriptioOrdersStatusModal: React.FC<IChangeSubscriptionOrdersStatusModal> = ({
  isOpen,
  onClose,
  status,
  invalidCount,
  showValidOnly,
  handleChangeStatus,
}) => {
  const { t } = useTranslation();
  const action = actions[status];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding top="3" right="5" left="5">
        <Typography variant="headerThree" textTransform="capitalize">
          {t(`${I18N_PATH}ActionSubscriptionOrders`, { action })}
        </Typography>{' '}
      </Layouts.Padding>
      <Layouts.Padding padding="5">
        <Typography as="span" variant="bodyMedium">
          {t(`${I18N_PATH}ItLooksLike`)}{' '}
        </Typography>
        <Typography as="span" variant="bodyMedium" fontWeight="bold">
          {t(`${I18N_PATH}InvalidCountSubscriptionOrder`, { invalidCount })}
        </Typography>{' '}
        <Typography as="span" variant="bodyMedium">
          {t(`${I18N_PATH}Missing`)}{' '}
        </Typography>
        <Typography as="span" variant="bodyMedium" fontWeight="bold">
          {t(`${I18N_PATH}Action`, { action })}
        </Typography>{' '}
        <Typography as="span" variant="bodyMedium">
          {t(`${I18N_PATH}ThemAll`)}
        </Typography>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding padding="4" left="5" right="5">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}> {t(`Text.Cancel`)}</Button>
          <Layouts.Flex>
            {showValidOnly ? (
              <Button onClick={() => handleChangeStatus(true)}>
                {startCase(t(`${I18N_PATH}OnlyValid`, { action }))}
              </Button>
            ) : null}

            <Layouts.Margin left="2">
              <Button variant="primary" onClick={() => handleChangeStatus(false)}>
                {startCase(t(`${I18N_PATH}All`, { action }))}
              </Button>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};

export default ChangeSubscriptioOrdersStatusModal;
