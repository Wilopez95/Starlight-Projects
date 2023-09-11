import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { IMaterialsQuickView } from './types';

const MaterialQuickViewActions: React.FC<IMaterialsQuickView> = ({ isLoading }) => {
  const { materialStore, systemConfigurationStore } = useStores();
  const { handleSubmit } = useFormikContext();
  const { closeQuickView } = useQuickViewContext();

  const selectedMaterial = materialStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedMaterial;
  const isDuplicating = systemConfigurationStore.isDuplicating;

  const handleDuplicate = () => systemConfigurationStore.toggleDuplicating();

  return (
    <ButtonContainer
      isCreating={isNew}
      isDuplicating={isDuplicating}
      onCancel={closeQuickView}
      onSave={() => handleSubmit()}
      onDuplicate={handleDuplicate}
      disabled={isLoading}
    />
  );
};

export default observer(MaterialQuickViewActions);
