import { useEffect, useMemo } from 'react';
import { useFormikContext } from 'formik';

import { IMasterRouteVariables } from '@root/api/masterRoute/types';
import { useCleanup, useStores } from '@root/hooks';
import { getBusinessLineTypesValue } from '@root/stores/dailyRoute/helpers';

import { INewSubscription } from '../types';

export const useMasterRoutes = () => {
  const { values } = useFormikContext<INewSubscription>();
  const { masterRouteStore, businessLineStore } = useStores();

  const businessLineType = businessLineStore.getById(values.businessLineId)?.type;

  const variables = useMemo(() => {
    const data: IMasterRouteVariables = {
      businessUnitId: +values.businessUnitId,
      input: {
        businessLineTypes: getBusinessLineTypesValue(businessLineType),
      },
    };

    if (values.serviceAreaId) {
      data.input.serviceAreaIds = [values.serviceAreaId];
    }

    return data;
  }, [businessLineType, values.businessUnitId, values.serviceAreaId]);

  const selectedRoutes: string[] = useMemo(
    () =>
      values.serviceItems.reduce(
        (routes: string[], { serviceDaysOfWeek }) =>
          serviceDaysOfWeek.reduce(
            (routeNames: string[], { route }) => (route ? [...routeNames, route] : routeNames),
            routes,
          ),
        [],
      ),
    [values.serviceItems],
  );

  useEffect(() => {
    masterRouteStore.setSelectedRoutes(selectedRoutes);
  }, [masterRouteStore, selectedRoutes]);

  useCleanup(masterRouteStore);

  useEffect(() => {
    (() => {
      if (!masterRouteStore.loaded) {
        masterRouteStore.cleanup();
        masterRouteStore.request(variables);
      }
    })();
  }, [masterRouteStore, variables]);
};
