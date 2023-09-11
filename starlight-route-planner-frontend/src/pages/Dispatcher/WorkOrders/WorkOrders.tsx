import React, { useCallback, useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';

import { IWorkOrdersParams } from '@root/api/workOrders';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import { ITabProps } from '../types';

import { DetailsQuickView, FiltersQuickView } from './quickViews';
import { WorkOrderTable } from './Table';

export const WorkOrders: React.FC<ITabProps> = observer(({ tableNavigationRef }) => {
  const { workOrdersStore, haulerStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();

  useEffect(() => {
    haulerStore.getHaulerItems();
  }, [haulerStore]);

  const onClose = useCallback(() => {
    workOrdersStore.toggleQuickView(false);
  }, [workOrdersStore]);

  const onSubmitFiltersOptions = useCallback(
    async (filterOptions: Omit<IWorkOrdersParams, 'serviceDate'>) => {
      await workOrdersStore.getWorkOrdersList(businessUnitId, filterOptions, {
        resetOffset: true,
        cleanUp: true,
      });

      if (workOrdersStore.isOpenQuickView) {
        onClose();
      }
    },
    [businessUnitId, workOrdersStore, onClose],
  );

  const handleWorkOrderClick = useCallback(
    (id: string) => {
      const route = pathToUrl(Paths.DispatchModule.WorkOrder, {
        businessUnit: businessUnitId,
        id,
      });

      history.push(route);
    },
    [history, businessUnitId],
  );

  return (
    <>
      <WorkOrderTable handleWorkOrderClick={handleWorkOrderClick} />
      <FiltersQuickView
        onClose={onClose}
        mainContainerRef={tableNavigationRef}
        onSubmitFiltersOptions={onSubmitFiltersOptions}
      />
      <Switch>
        <Route path={Paths.DispatchModule.WorkOrder} exact>
          <DetailsQuickView mainContainerRef={tableNavigationRef} />
        </Route>
      </Switch>
    </>
  );
});
