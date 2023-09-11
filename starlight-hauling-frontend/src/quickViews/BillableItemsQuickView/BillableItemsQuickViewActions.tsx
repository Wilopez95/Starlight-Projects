import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { BusinessLineType } from '@root/consts';
import { useBusinessContext, useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { ILineItem } from '@root/types';

import { BillableItemType, IBillableItemQuickView } from './types';

const BillableItemsQuickViewActions: React.FC<IBillableItemQuickView & { isLoading: boolean }> = ({
  isLoading,
  store,
  selectedTab,
}) => {
  const { closeQuickView } = useQuickViewContext();
  const { values, handleSubmit } = useFormikContext();
  const { businessLineId } = useBusinessContext();

  const { businessLineStore, systemConfigurationStore } = useStores();

  const selectedBillableItem = store.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isDuplicating = systemConfigurationStore.isDuplicating;
  const isNew = isCreating || !selectedBillableItem;

  const currentBusinessLine = businessLineStore.getById(businessLineId);

  const [_, canUpdateBillableItems] = useCrudPermissions('configuration', 'billable-items');

  const isTripCharge =
    selectedTab === BillableItemType.lineItem && (values as ILineItem).type === 'tripCharge';

  const handleDuplicate =
    [BillableItemType.threshold, BillableItemType.surcharge].includes(selectedTab) ||
    isTripCharge ||
    (currentBusinessLine?.type === BusinessLineType.recycling &&
      selectedTab === BillableItemType.service)
      ? undefined
      : systemConfigurationStore.toggleDuplicating.bind(systemConfigurationStore);

  return (
    <>
      {canUpdateBillableItems ? (
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

export default observer(BillableItemsQuickViewActions);
