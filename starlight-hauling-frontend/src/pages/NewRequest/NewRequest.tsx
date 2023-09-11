import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { type Point } from 'geojson';
import { observer } from 'mobx-react-lite';

import { InteractiveMap, Marker } from '@root/common';
import { type IInteractiveMapHandle, type IMarkerHandle } from '@root/common/InteractiveMap/types';
import { PageHeader } from '@root/components';
import { Paths } from '@root/consts';
import { useCleanup, useFetchBusinessUnit, useStores } from '@root/hooks';

import MasterRoutePoints from './NewRequestForm/forms/Subscription/sections/MasterRoutePoints/MasterRoutePoints';
import NewRequestForm from './NewRequestForm/NewRequestForm';

import styles from './css/styles.scss';

const NewOrderPage: React.FC = () => {
  const [suggestionCoords, setSuggestionCoords] = useState<Point>();
  const marker = useRef<IMarkerHandle>(null);
  const map = useRef<IInteractiveMapHandle>(null);
  const timeoutHandle = useRef<number | null>(null);

  const {
    orderStore,
    jobSiteStore,
    customerStore,
    projectStore,
    subscriptionStore,
    orderRequestStore,
    systemConfigurationStore,
  } = useStores();

  useCleanup(jobSiteStore);
  useCleanup(customerStore);
  useCleanup(projectStore);
  useCleanup(subscriptionStore);
  useCleanup(orderRequestStore);
  useFetchBusinessUnit();

  useEffect(() => {
    let cancel = false;
    if (cancel) return;
    setSuggestionCoords(jobSiteStore.location ?? jobSiteStore.selectedEntity?.location);
    marker.current?.flyToThis();
    return () => {
      cancel = true;
    };
  }, [jobSiteStore.selectedEntity, jobSiteStore.location]);

  useEffect(() => {
    let cancel = false;
    const didTransition = marker.current?.flyToThis();
    if (!didTransition) {
      timeoutHandle.current = window.setTimeout(() => {
        if (cancel) return;
        marker.current?.flyToThis();
        timeoutHandle.current = null;
      }, 2000);
    }
    return () => {
      cancel = true;
    };
  }, [suggestionCoords]);

  useEffect(() => {
    let cancel = false;
    if (timeoutHandle.current !== null) {
      if (cancel) return;
      window.clearTimeout(timeoutHandle.current);
    }
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    let cancel = false;
    if (orderStore.assignEquipmentOptions?.length >= 1) {
      if (cancel) return;
      map.current?.fitToMarkers();
    }
    return () => {
      cancel = true;
    };
  }, [orderStore, orderStore.assignEquipmentOptions]);

  // if toggleShow === false, filter inactive entities in configuration selects
  useEffect(() => {
    let cancel = false;

    if (cancel) return;
    systemConfigurationStore.toggleShow(false);

    return () => {
      cancel = true;
      systemConfigurationStore.toggleShow(true);
    };
  }, [systemConfigurationStore]);

  const isSubscriptionCreate = !!useRouteMatch(Paths.RequestModule.Subscription.Create);
  const isSubscriptionEdit = !!useRouteMatch(Paths.RequestModule.Subscription.Edit);
  const isSubscriptionClone = !!useRouteMatch(Paths.RequestModule.Subscription.Clone);

  const masterRoutesVisible = useMemo(
    () => [isSubscriptionCreate, isSubscriptionEdit, isSubscriptionClone].some(item => item),
    [isSubscriptionClone, isSubscriptionCreate, isSubscriptionEdit],
  );

  return (
    <>
      <PageHeader />
      <Layouts.Flex flexGrow={1}>
        <Layouts.Box minWidth="795px" width="50%" backgroundColor="white">
          <NewRequestForm />
        </Layouts.Box>
        <Layouts.Box width="50%">
          {suggestionCoords ? (
            <InteractiveMap
              ref={map}
              height="100vh"
              width="inherit"
              position="fixed"
              top="0"
              mapStyle={masterRoutesVisible ? 'dark' : 'default'}
            >
              {masterRoutesVisible ? <MasterRoutePoints /> : null}
              <Marker
                ref={marker}
                initialPosition={suggestionCoords}
                draggable={!jobSiteStore.selectedEntity}
                onDragEnd={jobSiteStore.changeLocation}
              />
              {orderStore.assignEquipmentOptions.map(equipment => (
                <Marker
                  key={equipment.id}
                  initialPosition={equipment.point}
                  text={`#${equipment.id}`}
                  selected={orderStore.assignedEquipmentItems.includes(equipment.id)}
                />
              ))}
            </InteractiveMap>
          ) : (
            <div className={styles.fallback} />
          )}
        </Layouts.Box>
      </Layouts.Flex>
    </>
  );
};

export default observer(NewOrderPage);
