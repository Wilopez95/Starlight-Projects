import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';
import { IMasterRoute } from '@root/types';

import { Form } from './Form';
import { IDetailsQuickView } from './types';

export const DetailsQuickView: React.FC<IDetailsQuickView> = observer(({ mainContainerRef }) => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const { masterRoutesStore } = useStores();

  const route = id ? masterRoutesStore.getById(id) : undefined;

  const [masterRoute, setMasterRoute] = useState<IMasterRoute | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      if (route) {
        setMasterRoute(route);
      }

      if (!route) {
        masterRoutesStore.toggleQuickViewLoading(true);

        const fetchedRoute = await masterRoutesStore.fetchMasterRouteById(+id);

        if (fetchedRoute) {
          setMasterRoute(fetchedRoute);
        }

        masterRoutesStore.toggleQuickViewLoading(false);
      }
    };

    load();
  }, [masterRoutesStore, route, id]);

  const onClose = useCallback(() => {
    const masterRouteTap = pathToUrl(Paths.DispatchModule.MasterRoutes, {
      businessUnit: businessUnitId,
    });

    history.push(masterRouteTap);
  }, [businessUnitId, history]);

  return (
    <QuickView
      condition
      parentRef={mainContainerRef}
      clickOutSelectors={['#master-router-map', '#master-route-quick-view']}
      isAnimated={false}
      loading={masterRoutesStore.quickViewLoading}
      error={!masterRoute}
    >
      {({ onAddRef, scrollContainerHeight }) => {
        if (masterRoute) {
          return (
            <Form
              info={masterRoute}
              onAddRef={onAddRef}
              scrollContainerHeight={scrollContainerHeight}
              onClose={onClose}
            />
          );
        }

        return null;
      }}
    </QuickView>
  );
});
