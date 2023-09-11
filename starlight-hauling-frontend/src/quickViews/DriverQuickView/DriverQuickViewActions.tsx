import React from 'react';
import { differenceInDays } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { IDriverFormikData } from '@root/types';

const DriverQuickViewActions: React.FC = () => {
  const [_, canEdit, canCreate] = useCrudPermissions('configuration', 'drivers-trucks');
  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit, isSubmitting, values } = useFormikContext<IDriverFormikData>();
  const { driverStore, systemConfigurationStore } = useStores();

  const selectedDriver = driverStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedDriver || isCreating;

  const disableEditing =
    (values.licenseValidityDate && differenceInDays(values.licenseValidityDate, new Date()) < 0) ||
    (values.medicalCardValidityDate &&
      differenceInDays(values.medicalCardValidityDate, new Date()) < 0);

  if (!canCreate || !canEdit) {
    return null;
  }

  return (
    <ButtonContainer
      isCreating={isNew}
      onSave={() => handleSubmit()}
      onCancel={closeQuickView}
      disabled={isSubmitting || disableEditing}
    />
  );
};

export default observer(DriverQuickViewActions);
