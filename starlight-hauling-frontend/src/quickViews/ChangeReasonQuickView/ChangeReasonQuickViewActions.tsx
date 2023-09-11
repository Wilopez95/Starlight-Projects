import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

const ChangeReasonQuickViewActions: React.FC = () => {
  const { handleSubmit, isSubmitting } = useFormikContext();
  const { closeQuickView } = useQuickViewContext();
  const { changeReasonStore, systemConfigurationStore } = useStores();
  const [_, canUpdateReasons] = useCrudPermissions('configuration', 'change-reasons');

  const selectedChangeReason = changeReasonStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedChangeReason || isCreating;

  if (!canUpdateReasons) {
    return null;
  }

  return (
    <ButtonContainer
      isCreating={isNew}
      disabled={isSubmitting}
      onSave={() => handleSubmit()}
      onCancel={closeQuickView}
    />
  );
};

export default observer(ChangeReasonQuickViewActions);
