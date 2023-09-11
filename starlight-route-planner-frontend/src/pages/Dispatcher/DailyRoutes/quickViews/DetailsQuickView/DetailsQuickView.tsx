import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { Button, EditIcon, Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { DailyRouteStatusBadge } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useDailyRoutesMap, useMergedMapData } from '@root/providers/DailyRoutesMapProvider';
import { QuickView, QuickViewHeaderTitle } from '@root/quickViews';
import { IDailyRoute } from '@root/types';

import { useDailyRouteActionsContext } from '../../common/DailyRouteActions/DailyRouteActions';

import * as Styles from './styles';
import { Tabs } from './Tabs';
import { IDetailsQuickView } from './types';

const I18N_PATH_ROUTE_DETAILS = 'quickViews.DailyRouteDetails.Text.';

export const DetailsQuickView: React.FC<IDetailsQuickView> = observer(({ mainContainerRef }) => {
  const { id } = useParams<{ id?: string }>();
  const [dailyRoute, setDailyRoute] = useState<IDailyRoute | null>(null);
  const history = useHistory();
  const { clearCustomized, handleCustomizedMarkers, handleCustomizedRoutesOptions } =
    useDailyRoutesMap();

  const { businessUnitId } = useBusinessContext();
  const { dailyRoutesStore, haulingTrucksStore, haulingDriversStore } = useStores();
  const { t } = useTranslation();
  const { dailyRoutesWorkOrders } = useMergedMapData();
  const dailyRouteActions = useDailyRouteActionsContext();

  const route = dailyRoutesStore.getById(id ?? null);

  useEffect(() => {
    return () => {
      haulingTrucksStore.cleanTruck();
      haulingDriversStore.cleanDriver();
    };
  }, [haulingTrucksStore, haulingDriversStore]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      if (route) {
        setDailyRoute(route);
      }

      if (!route) {
        dailyRoutesStore.toggleQuickViewLoading(true);

        const fetchedRoute = await dailyRoutesStore.fetchDailyRouteById(+id);

        if (fetchedRoute) {
          setDailyRoute(fetchedRoute);
        }

        dailyRoutesStore.toggleQuickViewLoading(false);
      }
    };

    load();
  }, [dailyRoutesStore, route, id]);

  useEffect(() => {
    if (!dailyRoute) {
      return;
    }

    dailyRoute.workOrders.forEach((workOrders, index) => {
      const exists = dailyRoutesWorkOrders.find(v => v.pinItemId === workOrders.id);

      if (exists) {
        handleCustomizedMarkers({
          ...exists,
          rootMarkerId: workOrders.id,
          showSequence: true,
        });

        // Draw on map markers options (for third level), pass original id key
        handleCustomizedRoutesOptions(workOrders.id, {
          optionColor: dailyRoute.color,
          visible: true,
          sequence: index + 1,
        });
      }
    });

    return () => {
      clearCustomized();
    };
  }, [
    dailyRoute,
    dailyRoutesWorkOrders,
    clearCustomized,
    handleCustomizedRoutesOptions,
    handleCustomizedMarkers,
  ]);

  const onClose = useCallback(() => {
    const urlRoute = pathToUrl(Paths.DispatchModule.DailyRoutes, {
      businessUnit: businessUnitId,
    });

    history.push(urlRoute);
  }, [history, businessUnitId]);

  return (
    <QuickView
      condition
      loading={dailyRoutesStore.quickViewLoading}
      error={!dailyRoute}
      parentRef={mainContainerRef}
      isAnimated={false}
    >
      {({ onAddRef, scrollContainerHeight }) => {
        if (dailyRoute) {
          return (
            <>
              <Layouts.Box ref={onAddRef} position="relative">
                <Layouts.Padding padding="2">
                  <Layouts.Flex alignItems="center">
                    <Styles.BackIcon cursor="pointer" onClick={onClose} />
                    <Typography variant="bodyMedium" color="information">
                      {t(`${I18N_PATH_ROUTE_DETAILS}BackToRoutesList`)}
                    </Typography>
                  </Layouts.Flex>
                </Layouts.Padding>
              </Layouts.Box>
              <Layouts.Scroll height={scrollContainerHeight}>
                <Layouts.Padding left="2" right="2" bottom="2">
                  <QuickViewHeaderTitle
                    name={dailyRoute.name}
                    color={dailyRoute.color}
                    businessLineType={dailyRoute.businessLineType}
                  >
                    {t(`${I18N_PATH_ROUTE_DETAILS}RouteNumber`)}
                    {dailyRoute.name}
                  </QuickViewHeaderTitle>
                  <Layouts.Margin top="1" />
                  <Layouts.Flex justifyContent="space-between" alignItems="center">
                    <DailyRouteStatusBadge
                      status={dailyRoute.status}
                      editingBy={dailyRoute.editingBy}
                    />
                    {dailyRoute.isEdited ? (
                      <Layouts.Flex alignItems="center">
                        <EditIcon />{' '}
                        <Layouts.Margin top="0.5" left="1">
                          <Styles.EditedLabel>
                            {t(`${I18N_PATH_ROUTE_DETAILS}Edited`)}
                          </Styles.EditedLabel>
                        </Layouts.Margin>
                      </Layouts.Flex>
                    ) : null}
                  </Layouts.Flex>
                  <Layouts.Padding top="2" bottom="2">
                    <Tabs dailyRoute={dailyRoute} />
                  </Layouts.Padding>
                </Layouts.Padding>
              </Layouts.Scroll>
              <Layouts.Box position="relative" ref={onAddRef}>
                <Divider />
                <Layouts.Padding top="2" bottom="2" left="3" right="3">
                  <Layouts.Flex justifyContent="space-between">
                    <Button
                      full
                      variant="primary"
                      onClick={async () => {
                        const { isValid } = await dailyRouteActions.triggerEdit(dailyRoute);

                        if (isValid) {
                          dailyRoutesStore.toggleDailyRouteModalSettings({
                            visible: true,
                            dailyRoute,
                          });
                        }
                      }}
                    >
                      {t(`${I18N_PATH_ROUTE_DETAILS}EditRoute`)}
                    </Button>
                  </Layouts.Flex>
                </Layouts.Padding>
              </Layouts.Box>
            </>
          );
        }

        return null;
      }}
    </QuickView>
  );
});
