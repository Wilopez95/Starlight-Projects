import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

const CustomerGroupActions: React.FC = () => {
  const { closeQuickView } = useQuickViewContext();
  const { customerGroupStore, systemConfigurationStore } = useStores();
  const { handleSubmit, isSubmitting } = useFormikContext();

  const isNew = systemConfigurationStore.isCreating || !customerGroupStore.selectedEntity;

  const [_, canUpdateCustomerGroups] = useCrudPermissions('configuration', 'customer-groups');

  if (!canUpdateCustomerGroups) {
    return null;
  }

  return (
    <ButtonContainer
      isCreating={isNew}
      onCancel={closeQuickView}
      disabled={isSubmitting}
      onSave={() => {
        handleSubmit();
      }}
    />
  );
};

export default observer(CustomerGroupActions);
