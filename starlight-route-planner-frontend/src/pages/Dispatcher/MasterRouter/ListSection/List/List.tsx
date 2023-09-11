import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { RoutesList } from '@root/pages/Dispatcher/common/RoutesList';
import { useMapBounds } from '@root/providers/MapBoundsProvider';
import { useMasterRoutesMap } from '@root/providers/MasterRoutesMapProvider';

import { useMasterRouteActionsContext } from '../../common/MasterRouteActions/MasterRouteActions';
import { ActionsParams, CheckValidDndParamsType } from '../../common/MasterRouteActions/types';

import { ListItem } from './ListItem';

export const List: React.FC = observer(() => {
  const { handleMasterRoutesOptions, clearMasterRoutesMap } = useMasterRoutesMap();
  const { masterRoutesStore } = useStores();

  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const masterRouteActions = useMasterRouteActionsContext();
  const { fitToMarkers } = useMapBounds();

  const handleRouteClick = useCallback(
    (id: number) => {
      // When use checked few master routes and click details view on another
      // Clear all visible master routes masters
      // Set current master route
      clearMasterRoutesMap();
      handleMasterRoutesOptions(id, { visible: true });

      const route = pathToUrl(Paths.DispatchModule.MasterRoute, {
        businessUnit: businessUnitId,
        id,
      });

      history.push(route);

      masterRoutesStore.setSingleCheckedRoute(id);

      const coordinates = masterRoutesStore.getCoordinatesById(id);

      fitToMarkers(coordinates);
    },
    [
      masterRoutesStore,
      history,
      businessUnitId,
      clearMasterRoutesMap,
      handleMasterRoutesOptions,
      fitToMarkers,
    ],
  );

  const handleCheckboxClick = useCallback(
    (id: number) => {
      masterRoutesStore.toggleCheckItem(id);
      const item = masterRoutesStore.getById(id);

      handleMasterRoutesOptions(id, { visible: item?.checked });

      const coordinates = masterRoutesStore.checkedRoutesCoordinates;

      fitToMarkers(coordinates);
    },
    [masterRoutesStore, handleMasterRoutesOptions, fitToMarkers],
  );

  const tryOpenEditMode = useCallback(
    ({ editData, dndData }: { editData: ActionsParams; dndData: CheckValidDndParamsType }) => {
      const isValid = masterRouteActions.checkIfValidDnd(dndData);

      if (isValid) {
        handleMasterRoutesOptions(editData.id, { visible: true });

        masterRouteActions.triggerEdit(editData);
      }
    },
    [masterRouteActions, handleMasterRoutesOptions],
  );
  return (
    <RoutesList count={masterRoutesStore.count} hasMore={false} loadMore={noop}>
      {masterRoutesStore.values
        .filter(route => route.businessUnitId === businessUnitId)
        .map(route => (
          <ListItem
            key={route.id}
            route={route}
            handleCheckboxClick={handleCheckboxClick}
            handleRouteClick={handleRouteClick}
            openEditMode={tryOpenEditMode}
          />
        ))}
    </RoutesList>
  );
});
