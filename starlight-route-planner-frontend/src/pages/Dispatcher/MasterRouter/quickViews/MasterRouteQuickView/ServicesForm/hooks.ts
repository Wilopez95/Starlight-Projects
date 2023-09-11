import { useCallback } from 'react';
import { useFormikContext } from 'formik';

import { useStores } from '@root/hooks';
import { useMasterRoutesMap } from '@root/providers/MasterRoutesMapProvider';
import { IMapMergeData, MarkerItemTypes } from '@root/types';

import { isEmpty } from 'lodash';
import { IMasterRouteCustomizedFormValues } from '..';

import { IServiceItemsToSet } from './types';

export const useAddItemsToList = () => {
  const { haulingServiceItemStore } = useStores();
  const { values, setFieldValue } = useFormikContext<IMasterRouteCustomizedFormValues>();
  const { handleCustomizedRoutesOptions, handleCustomizedMarkers } = useMasterRoutesMap();

  const tryAddItemsToList = useCallback(
    (ids: number[], jobSiteGroupedItems: number[], options?: Partial<IMapMergeData>) => {
      // TODO validate me when use simple dnd (without new mechanics)
      const serviceItemsToSet = ids.reduce<IServiceItemsToSet[]>((acc, id, index) => {
        const exists = values.serviceItems.find(serviceItem => serviceItem.id === id);

        if (exists) {
          return acc;
        }

        const haulingServiceItem = haulingServiceItemStore.getById(id);

        if (haulingServiceItem) {
          const currentSequence =
            (isEmpty(values.serviceItems) ? 0 : values.serviceItems.length) + index + 1;

          acc.push({
            ...haulingServiceItem,
            rootMarkerId: id,
            sequence: currentSequence,
            options,
          });
        }

        return acc;
      }, []);

      serviceItemsToSet.forEach(item => {
        handleCustomizedMarkers({
          coordinates: item.jobSite.coordinates,
          rootMarkerId: item.id,
          pinItemId: item.id,
          jobSiteId: item.jobSiteId,
          jobSiteGroupedItems,
          markerType: MarkerItemTypes.MASTER_ROUTES,
          color: '',
          ...item.options,
        });

        // When new item added redraw new pins on map (third level)
        handleCustomizedRoutesOptions(item.id, {
          optionColor: values.color,
          visible: true,
          sequence: item.sequence,
        });
      });

      const existingServiceItems = isEmpty(values.serviceItems) ? [] : values.serviceItems;
      setFieldValue('serviceItems', [...existingServiceItems, ...serviceItemsToSet]);

      return true;
    },
    [
      values.serviceItems,
      values.color,
      haulingServiceItemStore,
      setFieldValue,
      handleCustomizedMarkers,
      handleCustomizedRoutesOptions,
    ],
  );

  return {
    tryAddItemsToList,
  };
};
