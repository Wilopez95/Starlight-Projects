import React, { useCallback } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { IDashboardParams } from '@root/api';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { WeightTicketDetailsModal } from '@root/widgets/modals';

import { DailyRouteController } from '../DailyRoutes/common/DailyRouteActions/DailyRouteActions';
import { ITabProps } from '../types';

import { DetailsQuickView } from './quickViews/DetailsQuickView';
import { EditQuickView } from './quickViews/EditQuickView';
import FiltersQuickView from './quickViews/FiltersQuickView';
import { DashboardTable } from './Table/Table';

export const Dashboard: React.FC<ITabProps> = observer(({ tableNavigationRef }) => {
  const { dashboardStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();

  const { weightTickets, materialIds, initialIndex } = dashboardStore.weightTicketDetailsSettings;

  const onClose = useCallback(() => {
    dashboardStore.toggleQuickView(false);
  }, [dashboardStore]);

  const handleDailyRouteClick = useCallback(
    (id: number) => {
      const route = pathToUrl(Paths.DispatchModule.DashboardDetails, {
        businessUnit: businessUnitId,
        id,
      });

      history.push(route);
    },
    [history, businessUnitId],
  );

  const onSubmitFiltersOptions = useCallback(
    async (values: Omit<IDashboardParams, 'serviceDate'>) => {
      await dashboardStore.getDashboardList(businessUnitId, values, {
        resetOffset: true,
        cleanUp: true,
      });

      if (dashboardStore.isOpenQuickView) {
        onClose();
      }
    },
    [businessUnitId, dashboardStore, onClose],
  );

  const onEditQuickViewClose = useCallback(() => {
    dashboardStore.toggleQuickViewSettings();
  }, [dashboardStore]);

  const handleWeightTicketModalClose = useCallback(() => {
    dashboardStore.toggleWeightTicketDetails();
  }, [dashboardStore]);

  return (
    <>
      <DailyRouteController>
        <Layouts.Flex flexGrow={1}>
          <DashboardTable handleDailyRouteClick={handleDailyRouteClick} />
          <FiltersQuickView
            onClose={onClose}
            mainContainerRef={tableNavigationRef}
            onSubmitFiltersOptions={onSubmitFiltersOptions}
          />
          <Switch>
            <Route path={Paths.DispatchModule.DashboardDetails} exact>
              <DetailsQuickView mainContainerRef={tableNavigationRef} />
            </Route>
          </Switch>
          <EditQuickView mainContainerRef={tableNavigationRef} onClose={onEditQuickViewClose} />
        </Layouts.Flex>
      </DailyRouteController>
      {weightTickets && materialIds && (
        <WeightTicketDetailsModal
          weightTickets={weightTickets}
          materialIds={materialIds}
          initialIndex={initialIndex}
          onClose={handleWeightTicketModalClose}
        />
      )}
    </>
  );
});
