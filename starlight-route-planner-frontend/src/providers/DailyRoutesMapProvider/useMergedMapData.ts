import { groupBy } from 'lodash-es';

import { MarkerAssetType } from '@root/common';
import { useStores, useWayPointsFilteredBySettings } from '@root/hooks';
import { IMapMergeData, MarkerItemTypes } from '@root/types';

import { useMapSettings } from '../MapSettingsProvider';

const getPinType = (totalCount: number, filteredCount: number) => {
  if (!filteredCount) {
    return MarkerAssetType.unassigned;
  }

  if (totalCount === filteredCount) {
    return MarkerAssetType.assigned;
  }

  return MarkerAssetType.partialAssigned;
};

export const useMergedMapData = (showUnassignedJobSite?: boolean) => {
  const { dailyRoutesStore, workOrderDailyRouteStore, waypointsStore } = useStores();
  const { popupInfo: mapSettings } = useMapSettings();

  const groupedJobSites = groupBy(workOrderDailyRouteStore.values, ({ jobSiteId }) => jobSiteId);

  const jobSites = Object.keys(groupedJobSites).reduce<IMapMergeData[]>((acc, groupId) => {
    const currentGroup = groupedJobSites[groupId];
    const currentGroupCount = currentGroup.length;
    let pinType = MarkerAssetType.unassigned;

    if (currentGroupCount > 1) {
      const filteredCount = currentGroup.filter(({ dailyRouteId }) => !!dailyRouteId).length;

      pinType = getPinType(currentGroup.length, filteredCount);
    } else if (currentGroup[0].dailyRouteId) {
      pinType = MarkerAssetType.assigned;
    }

    acc.push({
      rootMarkerId: currentGroup[0].id,
      pinItemId: currentGroup[0].id,
      jobSiteId: currentGroup[0].jobSiteId,
      coordinates: currentGroup[0].jobSite.coordinates,
      assetsType: pinType,
      ...(currentGroupCount > 1 && {
        jobSiteGroupedItems: currentGroup.map(({ id }) => id),
      }),
      markerType: MarkerItemTypes.DAILY_ROUTES,
      showSequence: currentGroupCount > 1,
      badge: currentGroupCount > 1 ? currentGroupCount : undefined,
      color: '',
    });

    return acc;
  }, []);

  const dailyRoutesWorkOrders = dailyRoutesStore.values.reduce<IMapMergeData[]>(
    (acc, dailyRoute) => {
      const workOrders = dailyRoute.workOrders;

      for (const item of workOrders) {
        const group = groupedJobSites[item.jobSiteId].length;

        acc.push({
          rootMarkerId: dailyRoute.id,
          pinItemId: item.id,
          jobSiteId: item.jobSiteId,
          masterRouteId: dailyRoute.id,
          coordinates: item.jobSite.coordinates,
          color: dailyRoute.color,
          markerType: MarkerItemTypes.DAILY_ROUTES,
          showSequence: group > 1,
          badge: group > 1 ? group : undefined,
        });
      }

      return acc;
    },
    [],
  );

  const waypoints = useWayPointsFilteredBySettings(waypointsStore.values, mapSettings);

  return {
    jobSitesCount: jobSites.length,
    jobSites: showUnassignedJobSite
      ? jobSites.filter(jobSite => jobSite.assetsType !== MarkerAssetType.assigned)
      : jobSites,
    dailyRoutesWorkOrders,
    waypoints,
  };
};
