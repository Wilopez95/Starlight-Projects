import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

const TruckQuickViewActions: React.FC = () => {
  const [_, canEdit, canCreate] = useCrudPermissions('configuration', 'drivers-trucks');
  const { closeQuickView } = useQuickViewContext();
  const { isSubmitting, handleSubmit } = useFormikContext();
  const { truckStore, systemConfigurationStore } = useStores();

  const selectedTruck = truckStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedTruck || isCreating;

  if (!canEdit || !canCreate) {
    return null;
  }

  return (
    <ButtonContainer
      isCreating={isNew}
      onSave={() => handleSubmit()}
      onCancel={closeQuickView}
      disabled={isSubmitting}
    />
  );
};

export default observer(TruckQuickViewActions);
