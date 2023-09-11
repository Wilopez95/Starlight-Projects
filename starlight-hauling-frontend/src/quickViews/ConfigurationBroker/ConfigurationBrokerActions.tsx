import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

const ConfigurationBrokerActions: React.FC = () => {
  const { systemConfigurationStore, brokerStore } = useStores();
  const [_, canUpdateBrokers] = useCrudPermissions('configuration', 'brokers');
  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit, isSubmitting } = useFormikContext();

  const isCreating = systemConfigurationStore.isCreating;
  const selectedBroker = brokerStore.selectedEntity;
  const isNew = isCreating || !selectedBroker;

  if (!canUpdateBrokers) {
    return null;
  }

  return (
    <ButtonContainer
      isCreating={isNew}
      onSave={() => {
        handleSubmit();
      }}
      disabled={isSubmitting}
      onCancel={closeQuickView}
    />
  );
};

export default observer(ConfigurationBrokerActions);
