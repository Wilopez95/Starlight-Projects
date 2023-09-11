import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { IMaterialProfilesQuickView } from './types';

const MaterialProfilesQuickViewActions: React.FC<IMaterialProfilesQuickView> = ({ isLoading }) => {
  const { materialProfileStore, systemConfigurationStore } = useStores();
  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit } = useFormikContext();
  const [_, canUpdateMaterialProfiles] = useCrudPermissions('configuration', 'material-profiles');

  const selectedMaterialProfile = materialProfileStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedMaterialProfile;

  return (
    <>
      {canUpdateMaterialProfiles ? (
        <ButtonContainer
          isCreating={isNew}
          onCancel={closeQuickView}
          onSave={() => handleSubmit()}
          disabled={isLoading}
        />
      ) : null}
    </>
  );
};

export default observer(MaterialProfilesQuickViewActions);
