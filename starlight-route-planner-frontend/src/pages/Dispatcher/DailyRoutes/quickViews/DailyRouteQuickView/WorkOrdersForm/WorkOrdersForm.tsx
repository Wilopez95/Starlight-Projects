import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { isEmpty, uniq } from 'lodash-es';

import { DragNDropList } from '@root/common/DragNDropList';
import { IDropResult } from '@root/common/DragNDropList/types';
import { move } from '@root/helpers';
import { useStores } from '@root/hooks';
import { useDailyRoutesMap } from '@root/providers/DailyRoutesMapProvider';
import { MarkerItemTypes } from '@root/types';
import { AddMultipleWO, DailyRouteValidationModal } from '@root/widgets/modals';

import { FormDataType } from '../formikData';

import { useAddItemsToList } from './hooks';
import { SortableList } from './SortableList';

const I18N_PATH = 'quickViews.DailyRouteForm.WorkOrdersTab.Text.';

export const WorkOrdersForm: React.FC = () => {
  const { t } = useTranslation();
  const { invalidWorkOrders, tryAddItemsToList, clearInvalidWorkOrders } = useAddItemsToList();
  const { handleCustomizedRoutesOptions } = useDailyRoutesMap();
  const { errors, values, setFieldValue } = useFormikContext<FormDataType>();
  const [multipleItems, setMultipleItems] = useState<number[] | null>(null);
  const { dailyRoutesStore } = useStores();

  const previousSavedDroppedIds = useRef<number[]>([]);
  const mainJobSiteGroupedItems = useRef<number[]>([]);

  const { activeTabIndex, pinData } = dailyRoutesStore.dailyRouteModalSettings;

  const onCloseMultipleItems = () => {
    setMultipleItems(null);
  };

  // Handle adding item to list
  function handleMultipleWO(ids: number[]): void {
    previousSavedDroppedIds.current = uniq([...previousSavedDroppedIds.current, ...ids]);

    const result = tryAddItemsToList(ids, mainJobSiteGroupedItems.current, {
      badge: ids.length,
      showSequence: false,
    });

    if (result) {
      onCloseMultipleItems();
    }
  }
  // When work order item is dropped in list
  const onItemDrop = useCallback(
    (dragData: IDropResult) => {
      // Handle multiple items
      if (dragData.jobSiteGroupedItems) {
        mainJobSiteGroupedItems.current = dragData.jobSiteGroupedItems;

        let items;

        if (previousSavedDroppedIds.current.length) {
          items = dragData.jobSiteGroupedItems.filter(
            id => !previousSavedDroppedIds.current.includes(id),
          );
        } else {
          items = dragData.jobSiteGroupedItems;
        }

        setMultipleItems(items);

        return;
      }

      tryAddItemsToList([dragData.pinItemId], mainJobSiteGroupedItems.current, {
        showSequence: true,
        badge: undefined,
      });
    },
    [tryAddItemsToList, setMultipleItems],
  );

  useEffect(() => {
    if (activeTabIndex === 1 && pinData) {
      onItemDrop(pinData);
    }
  }, [activeTabIndex, pinData]);

  const onDelete = useCallback(
    (originalId: number) => {
      const updatedWorkOrders = values.workOrders.filter(({ id }) => id !== originalId);

      previousSavedDroppedIds.current = updatedWorkOrders.map(({ id }) => id);

      setFieldValue('workOrders', updatedWorkOrders);
      // Update markers sequence
      updatedWorkOrders.forEach((item, index) => {
        handleCustomizedRoutesOptions(item.id, {
          sequence: index + 1,
        });
      });
      // Remove from customized map to update the pin
      handleCustomizedRoutesOptions(originalId, {
        optionColor: undefined,
        visible: false,
        sequence: undefined,
      });
    },
    [values.workOrders, handleCustomizedRoutesOptions, setFieldValue],
  );

  // Sort array by new swap position
  const setSortedItems = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      if (oldIndex === newIndex) {
        // If these indexes are equal we can remove item from list
        // Need to pick ID of selected item
        const currentId = values.workOrders[oldIndex].id;

        onDelete(currentId);

        return;
      }

      if (!isEmpty(values.workOrders)) {
        const sortedServiceItems = move(values.workOrders, oldIndex, newIndex);

        sortedServiceItems.forEach((item, index) => {
          handleCustomizedRoutesOptions(item.id, {
            sequence: index + 1,
          });
        });

        setFieldValue('workOrders', sortedServiceItems);
      }
    },
    [values.workOrders, handleCustomizedRoutesOptions, setFieldValue, onDelete],
  );

  return (
    <>
      <DragNDropList
        title={t(`${I18N_PATH}Title`)}
        acceptType={MarkerItemTypes.DAILY_ROUTES}
        onItemDrop={onItemDrop}
        error={errors.workOrders as string}
      >
        <SortableList
          axis="y"
          distance={1}
          routeColor={values.color}
          items={values.workOrders}
          onDelete={onDelete}
          onSortEnd={setSortedItems}
        />
      </DragNDropList>
      {multipleItems && (
        <AddMultipleWO
          multipleItems={multipleItems}
          onClose={onCloseMultipleItems}
          onSubmit={handleMultipleWO}
        />
      )}
      {invalidWorkOrders && (
        <DailyRouteValidationModal
          onClose={clearInvalidWorkOrders}
          items={invalidWorkOrders}
          routeName={values.name}
        />
      )}
    </>
  );
};
