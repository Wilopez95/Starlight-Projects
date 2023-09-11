import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { IPermit } from '@root/types/entities/permit';

import { IPromosQuickViewData } from './types';

const PermitsQuickViewActions: React.FC<IPromosQuickViewData> = ({ isLoading }) => {
  const [_, canUpdatePermits] = useCrudPermissions('configuration', 'permits');

  const { permitStore, systemConfigurationStore } = useStores();
  const { handleSubmit } = useFormikContext<IPermit>();
  const { closeQuickView } = useQuickViewContext();

  const selectedPermit = permitStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedPermit;

  return (
    <>
      {canUpdatePermits ? (
        <ButtonContainer
          isCreating={isNew}
          onSave={() => handleSubmit()}
          onCancel={closeQuickView}
          disabled={isLoading}
        />
      ) : null}
    </>
  );
};

export default observer(PermitsQuickViewActions);
