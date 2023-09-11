import React from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';

import { Modal, Typography } from '@root/common';

import { type IRemoveServiceAreaModal } from './types';

import styles from './css/styles.scss';

const RemoveServiceAreaModal: React.FC<IRemoveServiceAreaModal> = ({
  isOpen,
  onClose,
  onRemove,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding padding="3" bottom="2">
        <Typography variant="headerThree">Remove Service Area</Typography>

        <Layouts.Padding top="3" bottom="2">
          <Typography variant="bodyMedium">
            Are you sure you want to remove the service area?
          </Typography>
        </Layouts.Padding>
        <Layouts.Padding top="2" bottom="1">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="alert" onClick={onRemove}>
              Remove Service Area
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Padding>
    </Modal>
  );
};

export default RemoveServiceAreaModal;
