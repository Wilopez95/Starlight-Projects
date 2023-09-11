import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { capitalize } from 'lodash-es';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { type CompletedOrApproved } from '@root/types';

import { type IChangeStatusModal } from './types';

import styles from './css/styles.scss';

const actions: Record<CompletedOrApproved, string> = {
  approved: 'finalize',
  completed: 'approve',
};

const ChangeStatusModal: React.FC<IChangeStatusModal> = ({
  isOpen,
  onClose,
  status,
  invalidCount,
  requestOptions,
}) => {
  const { orderStore } = useStores();

  const { businessUnitId } = requestOptions;
  const action = actions[status];
  const checkedCount = orderStore.checkedOrders.length;

  const handleChangeStatus = useCallback(
    async (validOnly: boolean) => {
      const ids = checkedCount > 0 ? orderStore.checkedOrders.map(order => order.id) : null;

      const payload = { validOnly, ids, businessUnitId };

      onClose?.();

      if (status === 'completed') {
        await orderStore.approveMultiple(payload, requestOptions);
      } else {
        await orderStore.finalizeMultiple(payload, requestOptions);
      }
    },
    [checkedCount, orderStore, businessUnitId, onClose, status, requestOptions],
  );

  const validOnlyDisabled =
    checkedCount > 0
      ? checkedCount === invalidCount
      : orderStore.getTabSize(status, requestOptions.mine) === invalidCount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding top="3" right="5" left="5">
        <Typography variant="headerThree" textTransform="capitalize">
          {action} Orders
        </Typography>
      </Layouts.Padding>
      <Layouts.Padding padding="5">
        <Typography variant="bodyMedium">
          It looks like{' '}
          <Typography as="span" fontWeight="bold">
            {invalidCount} order(s)
          </Typography>{' '}
          have missing data. Are you sure you want to{' '}
          <Typography as="span" fontWeight="bold">
            {action}
          </Typography>{' '}
          them all?
        </Typography>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding padding="4" left="5" right="5">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}>Cancel</Button>
          <Layouts.Flex>
            <Button disabled={validOnlyDisabled} onClick={() => handleChangeStatus(true)}>
              {capitalize(action)} only valid
            </Button>
            <Layouts.Margin left="2">
              <Button variant="primary" onClick={() => handleChangeStatus(false)}>
                {capitalize(action)} all
              </Button>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};

export default ChangeStatusModal;
