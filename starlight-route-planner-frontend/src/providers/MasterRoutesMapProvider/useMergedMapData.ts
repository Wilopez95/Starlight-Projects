import { useCallback, useMemo } from 'react';
import { groupBy } from 'lodash-es';

import { MarkerAssetType } from '@root/common';
import { ISingleServiceMRColors } from '@root/common/Pin/types';
import { useStores, useWayPointsFilteredBySettings } from '@root/hooks';
import { IMapMergeData, MarkerItemTypes, PinColorEnum } from '@root/types';

import { useMapSettings } from '../MapSettingsProvider';

// TODO fix duplicate keys (id`s)
export const useMergedMapData = (showUnassignedJobSite?: boolean) => {
  const { masterRoutesStore, haulingServiceItemStore, waypointsStore } = useStores();
  const { popupInfo: mapSettings } = useMapSettings();

  // This fix no valid items
  const filteredServiceItems = useMemo(() => {
    return haulingServiceItemStore.values.filter(
      item =>
        !!(
          (typeof item.serviceFrequencyId === 'number' && item.serviceFrequencyId === 108) ||
          'serviceDaysOfWeek' in item
        ) && item.billableServiceDescription !== 'not a service',
    );
  }, [haulingServiceItemStore.values]);

  const groupedServiceItems = useMemo(
    () => groupBy(filteredServiceItems, ({ jobSiteId }) => jobSiteId),
    [filteredServiceItems],
  );

  const jobSites: IMapMergeData[] = useMemo(() => {
    const masterRoutesColors = masterRoutesStore.serviceItemsAssignmentInfo;

    const filtered = filteredServiceItems.map(serviceItem => {
      // assigned - for design purpose. those pins have dedicated sections to display assigned/unassigned days
      const singlePinType = MarkerAssetType.assigned;
      let groupPinType = MarkerAssetType.unassigned;
      const singleServiceMRColors: ISingleServiceMRColors[] = [];

      const { id, serviceDaysOfWeek, jobSiteId } = serviceItem;

      const groupedServices = groupedServiceItems[jobSiteId];

      // Find the unique IdSubscriptions from the services.
      let subscriptionsCount = 0;
      let groupCount = 0;
      if (groupedServices.length > 0) {
        groupCount = groupedServices.length;

        const availableSubscriptions = groupedServices.filter(
          (value, index, self) =>
            self.findIndex(v => v.subscriptionId === value.subscriptionId) === index,
        );
        subscriptionsCount = availableSubscriptions.length;
      }

      const isGroupedService = groupCount > 1;

      if (isGroupedService) {
        /* eslint-disable @typescript-eslint/no-unnecessary-condition */
        const allRoutes = groupedServices
          .flatMap(service =>
            Object.values(service.serviceDaysOfWeek ? service.serviceDaysOfWeek : {}),
          )
          .map(day => day.route);

        const assignedRoutes = allRoutes.filter(Boolean);

        groupPinType =
          assignedRoutes.length === allRoutes.length
            ? MarkerAssetType.assigned
            : assignedRoutes.length
            ? MarkerAssetType.partialAssigned
            : MarkerAssetType.unassigned;
      } else {
        // life disk ⭕ props
        Object.values(serviceDaysOfWeek ? serviceDaysOfWeek : {}).forEach(({ route = '' }) => {
          const MRColor = masterRoutesColors.get(route);

          MRColor
            ? singleServiceMRColors.push(MRColor)
            : singleServiceMRColors.push({
                color: PinColorEnum.unassigned,
              });
        });
      }

      return {
        rootMarkerId: id,
        pinItemId: id,
        jobSiteId,
        coordinates: serviceItem.jobSite.coordinates,
        assetsType: isGroupedService ? groupPinType : singlePinType,
        ...(groupCount > 1 && {
          jobSiteGroupedItems: groupedServiceItems[jobSiteId].map(serviceitem => serviceitem.id),
        }),
        markerType: MarkerItemTypes.MASTER_ROUTES,
        showSequence: groupCount < 2,
        badge: subscriptionsCount > 1 ? subscriptionsCount : undefined,
        singleServiceMRColors,
        customerId: serviceItem.customerId,
        color: '',
      };
    });

    return filtered;
  }, [filteredServiceItems, groupedServiceItems, masterRoutesStore.serviceItemsAssignmentInfo]);

  const masterRoutesServiceItems = useMemo(() => {
    return masterRoutesStore.values.reduce<IMapMergeData[]>((acc, masterRoute) => {
      const serviceItems = masterRoute.serviceItems;

      //  TODO: add sequence to marker when master route details quick-view is opened
      for (const item of serviceItems) {
        const group =
          groupedServiceItems[item.jobSiteId]?.length > 0
            ? groupedServiceItems[item.jobSiteId]?.length
            : 0;

        acc.push({
          rootMarkerId: masterRoute.id,
          pinItemId: item.id,
          jobSiteId: item.jobSiteId,
          masterRouteId: masterRoute.id,
          coordinates: item.jobSite.coordinates,
          ...((groupedServiceItems[item.jobSiteId]?.length > 0
            ? groupedServiceItems[item.jobSiteId]?.length
            : 0) > 1 && {
            jobSiteGroupedItems: groupedServiceItems[item.jobSiteId]?.map(({ id }) => id),
          }),
          color: masterRoute.color,
          markerType: MarkerItemTypes.MASTER_ROUTES,
          showSequence: group < 2,
          badge: group > 1 ? group : undefined,
        });
      }

      return acc;
    }, []);
  }, [masterRoutesStore.values, groupedServiceItems]);

  const waypoints = useWayPointsFilteredBySettings(waypointsStore.values, mapSettings);

  const getMergedMapItemById = useCallback(
    (id: number) => {
      return jobSites.find(item => item.pinItemId === id);
    },
    [jobSites],
  );

  return {
    jobSitesCount: jobSites.length > 0 ? jobSites.length : 0,
    jobSites: showUnassignedJobSite
      ? jobSites.filter(jobSite => jobSite.assetsType !== MarkerAssetType.assigned)
      : jobSites,
    masterRoutesServiceItems,
    getMergedMapItemById,
    waypoints,
  };
};
