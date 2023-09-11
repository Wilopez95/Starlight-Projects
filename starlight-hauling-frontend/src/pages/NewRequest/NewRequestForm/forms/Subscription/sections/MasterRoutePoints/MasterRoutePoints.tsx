import React, { useMemo } from 'react';
import { isEmpty, isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Marker } from '@root/common';
import { IMarker } from '@root/common/InteractiveMap/types';
import { useStores } from '@root/hooks';

const MasterRoutePoints: React.FC = () => {
  const { masterRouteStore } = useStores();

  const points = useMemo(
    () =>
      (isEmpty(masterRouteStore.selectedRoutes)
        ? masterRouteStore.values
        : masterRouteStore.selectedRoutes
      ).reduce((data: IMarker[], route) => {
        const items: IMarker[] = route.serviceItems.map(({ jobSite: { coordinates } }) => ({
          initialPosition: {
            type: 'Point',
            coordinates,
          },
          color: route.color,
        }));

        return [
          ...data,
          ...items.filter(item => {
            return !data.find(dataItem => {
              return isEqual(
                dataItem.initialPosition.coordinates,
                item.initialPosition.coordinates,
              );
            });
          }),
        ];
      }, []),
    [masterRouteStore.selectedRoutes, masterRouteStore.values],
  );

  return (
    <>
      {points.map(props => (
        <Marker key={props.initialPosition.coordinates.join('-')} {...props} />
      ))}
    </>
  );
};

export default observer(MasterRoutePoints);
