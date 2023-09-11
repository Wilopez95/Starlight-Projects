import { useCallback, useState } from 'react';
import { useFormikContext } from 'formik';

import { validateLineOfBusiness } from '@root/helpers/validateLineOfBusiness';
import { useStores } from '@root/hooks';
import { useDailyRoutesMap } from '@root/providers/DailyRoutesMapProvider';
import { IMapMergeData, MarkerItemTypes } from '@root/types';

import { FormDataType, ICustomizedWorkOrder } from '../formikData';

export const useAddItemsToList = () => {
  const { workOrderDailyRouteStore, businessLineStore } = useStores();
  const { values, setFieldValue } = useFormikContext<FormDataType>();
  const { handleCustomizedMarkers, handleCustomizedRoutesOptions } = useDailyRoutesMap();

  const [invalidWorkOrders, setInvalidWorkOrders] = useState<ICustomizedWorkOrder[] | null>(null);

  const clearInvalidWorkOrders = useCallback(() => {
    setInvalidWorkOrders(null);
  }, [setInvalidWorkOrders]);

  const tryAddItemsToList = useCallback(
    (ids: number[], jobSiteGroupedItems: number[], options?: Partial<IMapMergeData>) => {
      const workOrders = ids.reduce<ICustomizedWorkOrder[]>((acc, id) => {
        const exists = values.workOrders.find(workOrder => workOrder.id === id);

        if (exists) {
          return acc;
        }

        const workOrderItem = workOrderDailyRouteStore.getById(id);

        if (workOrderItem) {
          const currentSequence = values.workOrders.length + 1;

          acc.push({
            ...workOrderItem,
            rootMarkerId: workOrderItem.id,
            jobSiteId: workOrderItem.jobSiteId,
            pinItemId: workOrderItem.id,
            sequence: currentSequence,
            coordinates: workOrderItem.jobSite.coordinates,
            color: '',
          });

          handleCustomizedMarkers({
            coordinates: workOrderItem.jobSite.coordinates,
            rootMarkerId: workOrderItem.id,
            pinItemId: id,
            jobSiteId: workOrderItem.jobSiteId,
            ...options,
            color: '',
          });

          handleCustomizedRoutesOptions(workOrderItem.id, {
            optionColor: values.color,
            visible: true,
            sequence: currentSequence,
          });
        }

        return acc;
      }, []);

      const invalidItems = validateLineOfBusiness({
        presentItems: values.workOrders,
        droppedItems: workOrders,
        businessLineStore,
      });

      if (invalidItems.length) {
        setInvalidWorkOrders(invalidItems);

        return false;
      }

      workOrders.forEach(workOrderItem => {
        handleCustomizedMarkers({
          coordinates: workOrderItem.jobSite.coordinates,
          rootMarkerId: workOrderItem.id,
          pinItemId: workOrderItem.id,
          jobSiteId: workOrderItem.jobSiteId,
          jobSiteGroupedItems,
          markerType: MarkerItemTypes.DAILY_ROUTES,
          ...options,
          color: '',
        });

        handleCustomizedRoutesOptions(workOrderItem.id, {
          optionColor: values.color,
          visible: true,
          sequence: workOrderItem.sequence,
        });
      });

      setFieldValue('workOrders', [...values.workOrders, ...workOrders]);

      return true;
    },
    [
      values.workOrders,
      values.color,
      workOrderDailyRouteStore,
      businessLineStore,
      setFieldValue,
      handleCustomizedMarkers,
      handleCustomizedRoutesOptions,
    ],
  );

  return { invalidWorkOrders, tryAddItemsToList, clearInvalidWorkOrders };
};
