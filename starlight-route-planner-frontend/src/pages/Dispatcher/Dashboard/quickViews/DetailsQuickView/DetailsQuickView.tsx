import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { DailyRouteStatusBadge } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useDailyRouteActionsContext } from '@root/pages/Dispatcher/DailyRoutes/common/DailyRouteActions/DailyRouteActions';
import { QuickView, QuickViewHeaderTitle } from '@root/quickViews';
import { IDailyRoute, IDailyRouteReport, IDashboardDailyRoute } from '@root/types';
import { DailyRouteReportModal } from '@root/widgets/modals';

import { Tabs } from './Tabs';
import { IDetailsQuickView } from './types';

const I18N_PATH = 'quickViews.DashboardDailyRoute.Text.';
const I18N_ROOT_PATH = 'Text.';

export const DetailsQuickView: React.FC<IDetailsQuickView> = observer(({ mainContainerRef }) => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const { dashboardStore } = useStores();
  const [dailyRoute, setDailyRoute] = useState<IDashboardDailyRoute | null>(null);
  const dailyRouteActions = useDailyRouteActionsContext();
  const route = dashboardStore.getById(id ?? null);
  const [dailyRouteReport, setDailyRouteReport] = useState<IDailyRouteReport | undefined>(
    undefined,
  );
  const [dailyRouteReportModalVisible, setDailyRouteReportModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      if (route) {
        setDailyRoute(route);
      }

      if (!route) {
        dashboardStore.toggleQuickViewLoading();

        const fetchedRoute = await dashboardStore.fetchDashboardDailyRouteById(+id);

        if (fetchedRoute) {
          setDailyRoute(fetchedRoute);
        }

        dashboardStore.toggleQuickViewLoading();
      }
    };

    load();

    return () => {
      setDailyRoute(null);
    };
  }, [dashboardStore, route, id]);

  const onClose = useCallback(() => {
    const urlRoute = pathToUrl(Paths.DispatchModule.Dashboard, {
      businessUnit: businessUnitId,
    });

    history.push(urlRoute);
  }, [history, businessUnitId]);

  const handleDailyRouteReportModalOpen = useCallback(
    async (dailyRouteId: number) => {
      setDailyRouteReportModalVisible(true);

      const result = await dashboardStore.getDailyRouteReport(dailyRouteId);

      if (result) {
        setDailyRouteReport(result);
      }
    },
    [dashboardStore, setDailyRouteReport, setDailyRouteReportModalVisible],
  );

  const handleDailyRouteReportModalClose = useCallback(() => {
    setDailyRouteReport(undefined);
    setDailyRouteReportModalVisible(false);
  }, [setDailyRouteReport]);

  return (
    <>
      {dailyRoute && dailyRouteReportModalVisible ? (
        <DailyRouteReportModal
          dailyRouteReport={dailyRouteReport}
          dailyRouteServiceDate={dailyRoute.serviceDate}
          dailyRouteNumber={dailyRoute.id}
          onClose={handleDailyRouteReportModalClose}
        />
      ) : null}
      <QuickView
        condition
        loading={dashboardStore.quickViewLoading}
        error={!dailyRoute}
        parentRef={mainContainerRef}
        isAnimated={false}
        clickOutHandler={onClose}
        clickOutSelectors={['#edit-quickview']}
      >
        {({ onAddRef, scrollContainerHeight }) => {
          if (dailyRoute) {
            return (
              <>
                <Layouts.Scroll height={scrollContainerHeight}>
                  <Layouts.Padding left="2" right="2" bottom="2">
                    <QuickViewHeaderTitle name={dailyRoute.name}>
                      {t(`${I18N_PATH}RouteNumber`)}
                      {dailyRoute.name}
                    </QuickViewHeaderTitle>
                    <Layouts.Margin top="1" />
                    <Layouts.Flex alignItems="center">
                      <DailyRouteStatusBadge
                        status={dailyRoute.status}
                        editingBy={dailyRoute.editingBy}
                      />
                      <Layouts.Margin left="1">{dailyRoute.completionRate}%</Layouts.Margin>
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
                      <Button onClick={() => handleDailyRouteReportModalOpen(dailyRoute.id)}>
                        {t(`${I18N_ROOT_PATH}RouteSheet`)}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={async () => {
                          //TODO: check and refactor IDailyRoute and IDashboardDailyRoute interfaces
                          const { isValid } = await dailyRouteActions.triggerEdit(
                            dailyRoute as IDailyRoute,
                          );

                          if (isValid) {
                            dashboardStore.toggleQuickViewSettings({
                              visible: true,
                              dailyRoute,
                            });
                          }
                        }}
                      >
                        {t(`${I18N_PATH}EditRoute`)}
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
    </>
  );
});
