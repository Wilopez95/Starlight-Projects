import React, { useCallback, useState } from 'react';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useBoolean, useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { ITruckAndDriverCost } from '@root/types';

import { ConfirmTruckAndDriverCostExist, WarningTruckAndDriverCostExist } from './components';
import {
  getDuplicatedDriverCosts,
  getDuplicatedTruckCosts,
  getDuplicatedTruckTypeCosts,
} from './helpers';
import { ITruckAndDriverQuickViewActions } from './types';

const TruckAndDriverQuickViewActions: React.FC<ITruckAndDriverQuickViewActions> = ({
  businessUnitOptions,
}) => {
  const { closeQuickView, onDuplicate } = useQuickViewContext();
  const { handleSubmit, values, setValues } = useFormikContext<ITruckAndDriverCost>();
  const [_, canUpdateOperatingCosts] = useCrudPermissions('configuration', 'operating-costs');
  const {
    systemConfigurationStore,
    truckAndDriverCostStore,
    truckStore,
    truckTypeStore,
    driverStore,
  } = useStores();
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useBoolean();
  const [isWarningModalOpen, openWarningModal, closeWarningModal] = useBoolean();
  const selectedTruckAndDriverCosts = truckAndDriverCostStore.selectedEntity;

  const [valuesForDuplicating, setValuesForDuplicating] = useState<ITruckAndDriverCost>(values);

  const handleUpdateByDuplicatedValues = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      closeWarningModal();
      if (selectedTruckAndDriverCosts) {
        setValues({
          ...selectedTruckAndDriverCosts,
          detailedCosts: valuesForDuplicating.detailedCosts,
          averageCost: valuesForDuplicating.averageCost,
          driverAverageCost: valuesForDuplicating.driverAverageCost,
          truckAverageCost: valuesForDuplicating.truckAverageCost,
          truckTypeCosts: getDuplicatedTruckTypeCosts(
            truckTypeStore.values,
            valuesForDuplicating.truckTypeCosts,
          ),
          truckCosts: getDuplicatedTruckCosts(truckStore.values, valuesForDuplicating.truckCosts),
          driverCosts: getDuplicatedDriverCosts(
            driverStore.values,
            valuesForDuplicating.driverCosts,
          ),
        });
      }
    },
    [
      valuesForDuplicating,
      closeWarningModal,
      selectedTruckAndDriverCosts,
      driverStore.values,
      truckStore.values,
      truckTypeStore.values,
      setValues,
    ],
  );

  const isNew = systemConfigurationStore.isCreating || !selectedTruckAndDriverCosts;
  const isDuplicating = systemConfigurationStore.isDuplicating;

  return (
    <>
      <WarningTruckAndDriverCostExist
        isOpen={isWarningModalOpen}
        onClose={closeWarningModal}
        handleUpdate={handleUpdateByDuplicatedValues}
      />

      <ConfirmTruckAndDriverCostExist
        date={values.date}
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        businessUnitOptions={businessUnitOptions}
        businessUnitId={values.businessUnitId}
        openWarningModal={openWarningModal}
        onDuplicate={onDuplicate}
        setValuesForDuplicating={setValuesForDuplicating}
      />
      <ButtonContainer
        isDuplicating={isDuplicating}
        isCreating={isNew}
        onCancel={closeQuickView}
        disabled={!canUpdateOperatingCosts}
        onDuplicate={openConfirmModal}
        onSave={
          canUpdateOperatingCosts
            ? () => {
                handleSubmit();
              }
            : noop
        }
      />
    </>
  );
};

export default observer(TruckAndDriverQuickViewActions);
