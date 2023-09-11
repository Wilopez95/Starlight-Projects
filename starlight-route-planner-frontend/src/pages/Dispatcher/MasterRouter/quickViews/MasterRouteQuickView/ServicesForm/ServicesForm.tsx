import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { isEmpty, uniq } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DragNDropList } from '@root/common/DragNDropList';
import { IDropResult } from '@root/common/DragNDropList/types';
import { move } from '@root/helpers';
import { useStores } from '@root/hooks';
import { useMasterRoutesMap } from '@root/providers/MasterRoutesMapProvider';
import { MarkerItemTypes } from '@root/types';
import { AddMultipleServiceItemsModal } from '@root/widgets/modals';

import { useMasterRouteActionsContext } from '../../../common/MasterRouteActions/MasterRouteActions';
import { IMasterRouteCustomizedFormValues } from '../types';

import { useAddItemsToList } from './hooks';
import { SortableList } from './SortableList';

const I18N_PATH = 'quickViews.MasterRouteView.ServicesTab.Text.';

interface IServicesForm {
  isEdited: boolean;
}

export const ServicesForm: React.FC<IServicesForm> = observer(() => {
  const { t } = useTranslation();
  const { values, errors, setFieldValue } = useFormikContext<IMasterRouteCustomizedFormValues>();
  const { serviceItems, color: routeColor } = values;
  const { tryAddItemsToList } = useAddItemsToList();
  const { masterRoutesStore } = useStores();

  const masterRouteActions = useMasterRouteActionsContext();

  const { handleCustomizedRoutesOptions } = useMasterRoutesMap();
  const [multipleItems, setMultipleItems] = useState<number[] | null>(null);

  const previousSavedDroppedIds = useRef<number[]>([]);
  const mainJobSiteGroupedItems = useRef<number[]>([]);

  const { activeTabIndex, pinData } = masterRoutesStore.masterRouteModalSettings;

  // When service item is dropped in list
  const onItemDrop = useCallback(
    (dragData: IDropResult) => {
      const isValid = masterRouteActions.checkIfValidDnd({
        routeName: values.name,
        serviceItems: values.serviceItems,
        serviceDaysList: values.serviceDaysList,
        ids: dragData.jobSiteGroupedItems ? dragData.jobSiteGroupedItems : [dragData.pinItemId],
      });

      if (isValid) {
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
      }
    },
    [setMultipleItems, tryAddItemsToList, masterRouteActions, values],
  );

  useEffect(() => {
    if (activeTabIndex === 1 && pinData) {
      onItemDrop(pinData);
    }
  }, [activeTabIndex, pinData]);

  const onCloseMultipleItems = () => {
    setMultipleItems(null);
  };

  const handleMultipleServiceItems = (ids: number[]) => {
    previousSavedDroppedIds.current = uniq([...previousSavedDroppedIds.current, ...ids]);

    const result = tryAddItemsToList(ids, mainJobSiteGroupedItems.current, {
      badge: ids.length,
      showSequence: false,
    });

    if (result) {
      onCloseMultipleItems();
    }
  };

  const onDelete = useCallback(
    (originalId: number) => {
      const updatedServiceItems = values.serviceItems.filter(({ id }) => id !== originalId);

      previousSavedDroppedIds.current = updatedServiceItems.map(({ id }) => id);

      setFieldValue('serviceItems', updatedServiceItems);
      // Update markers sequence
      updatedServiceItems.forEach((item, index) => {
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
    [values.serviceItems, setFieldValue, handleCustomizedRoutesOptions],
  );
  // Sort array by new swap position
  const setSortedItems = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      if (oldIndex === newIndex) {
        // If these indexes are equal we can remove item from list
        // Need to pick ID of selected item
        const currentId = serviceItems[oldIndex].id;

        onDelete(currentId);

        return;
      }

      if (!isEmpty(serviceItems)) {
        const sortedServiceItems = move(serviceItems, oldIndex, newIndex);

        sortedServiceItems.forEach((item, index) => {
          handleCustomizedRoutesOptions(item.id, {
            sequence: index + 1,
          });
        });

        setFieldValue('serviceItems', sortedServiceItems);
      }
    },
    [setFieldValue, onDelete, serviceItems, handleCustomizedRoutesOptions],
  );

  return (
    <>
      <DragNDropList
        title={t(`${I18N_PATH}Title`)}
        acceptType={MarkerItemTypes.MASTER_ROUTES}
        onItemDrop={onItemDrop}
        error={errors.serviceItems as string}
      >
        <SortableList
          axis="y"
          distance={1}
          routeColor={routeColor}
          items={serviceItems}
          onDelete={onDelete}
          onSortEnd={setSortedItems}
        />
      </DragNDropList>
      {multipleItems && (
        <AddMultipleServiceItemsModal
          serviceItemsIds={multipleItems}
          onClose={onCloseMultipleItems}
          onSubmit={handleMultipleServiceItems}
        />
      )}
    </>
  );
});
