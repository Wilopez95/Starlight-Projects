import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { IEquipmentItemsQuickView } from './types';

const EquipmentItemsQuickView: React.FC<IEquipmentItemsQuickView> = ({ isLoading }) => {
  const { equipmentItemStore, systemConfigurationStore } = useStores();
  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit } = useFormikContext();
  const [_, canUpdateEquipment] = useCrudPermissions('configuration', 'equipment');

  const selectedEquipmentItem = equipmentItemStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedEquipmentItem;
  const isDuplicating = systemConfigurationStore.isDuplicating;

  const handleDuplicate = () => systemConfigurationStore.toggleDuplicating();

  return (
    <>
      {canUpdateEquipment ? (
        <ButtonContainer
          isCreating={isNew}
          isDuplicating={isDuplicating}
          onCancel={closeQuickView}
          onSave={() => handleSubmit()}
          onDuplicate={handleDuplicate}
          disabled={isLoading}
        />
      ) : null}
    </>
  );
};

export default observer(EquipmentItemsQuickView);
