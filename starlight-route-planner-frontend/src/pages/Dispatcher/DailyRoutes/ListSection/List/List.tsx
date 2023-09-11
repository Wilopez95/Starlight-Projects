import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import noop from 'lodash-es/noop';
import { observer } from 'mobx-react-lite';

import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { RoutesList } from '@root/pages/Dispatcher/common/RoutesList';
import { useDailyRoutesMap } from '@root/providers/DailyRoutesMapProvider';
import { useMapBounds } from '@root/providers/MapBoundsProvider';

import { IDailyRoute } from '@root/types';
import { IDropResult } from '@root/common/DragNDropList/types';
import { useDailyRouteActionsContext } from '../../common/DailyRouteActions/DailyRouteActions';

import { ListItem } from './ListItem';

export const List: React.FC = observer(() => {
  const { handleDailyRoutesOptions, clearDailyRoutesMap } = useDailyRoutesMap();
  const { dailyRoutesStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const { fitToMarkers } = useMapBounds();

  const dailyRouteActions = useDailyRouteActionsContext();

  const handleRouteClick = useCallback(
    (id: number) => {
      // Clear all visible master routes masters
      // Set current route
      clearDailyRoutesMap();
      handleDailyRoutesOptions(id, { visible: true });

      const route = pathToUrl(Paths.DispatchModule.DailyRoute, {
        businessUnit: businessUnitId,
        id,
      });

      history.push(route);

      dailyRoutesStore.setSingleCheckedRoute(id);

      const coordinates = dailyRoutesStore.getCoordinatesById(id);

      fitToMarkers(coordinates);
    },
    [
      businessUnitId,
      history,
      clearDailyRoutesMap,
      handleDailyRoutesOptions,
      dailyRoutesStore,
      fitToMarkers,
    ],
  );
  interface MyDropObject extends IDropResult, IDailyRoute {
    // Define any additional properties you need for your drag object
  }

  const tryOpenEditMode = useCallback(
    async (dropData: MyDropObject) => {
      const { isValid } = await dailyRouteActions.triggerEdit(dropData);

      if (isValid) {
        handleDailyRoutesOptions(dropData.id, { visible: true });

        dailyRoutesStore.toggleDailyRouteModalSettings({
          ...dropData,
          id: dropData.id,
          activeTabIndex: 1,
          pinData: { ...dropData },
        });
      }
    },
    [dailyRouteActions, dailyRoutesStore, handleDailyRoutesOptions],
  );

  const handleCheckboxClick = useCallback(
    (id: number) => {
      dailyRoutesStore.toggleCheckItem(id);
      const item = dailyRoutesStore.getById(id);

      handleDailyRoutesOptions(id, { visible: item?.checked });

      const coordinates = dailyRoutesStore.checkedRoutesCoordinates;

      fitToMarkers(coordinates);
    },
    [dailyRoutesStore, handleDailyRoutesOptions, fitToMarkers],
  );

  return (
    <RoutesList count={dailyRoutesStore.count} hasMore={dailyRoutesStore.hasMore} loadMore={noop}>
      {dailyRoutesStore.values.map(route => (
        <ListItem
          key={route.id}
          route={route}
          handleCheckboxClick={handleCheckboxClick}
          handleRouteClick={handleRouteClick}
          tryOpenEditMode={tryOpenEditMode}
        />
      ))}
    </RoutesList>
  );
});
