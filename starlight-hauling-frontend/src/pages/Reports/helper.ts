import { useMemo } from 'react';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

export const useLineOfBusiness = (): string => {
  const { businessLineStore, reportStore } = useStores();
  let mappedIds: number[];

  if (reportStore.linesOfBusiness[0] === 0) {
    mappedIds = businessLineStore.values.map(({ id }) => id);
  } else {
    mappedIds = reportStore.linesOfBusiness;
  }

  return mappedIds.join(',');
};

export const useNavigationTabs = (): RoutingNavigationItem[] => {
  const { businessUnitId } = useBusinessContext();

  return useMemo(
    () => [
      {
        content: 'Operational',
        to: pathToUrl(Paths.ReportsModule.Reports, {
          businessUnit: businessUnitId,
          subPath: Routes.Operational,
          id: undefined,
        }),
      },
      {
        content: 'Sales',
        to: pathToUrl(Paths.ReportsModule.Reports, {
          businessUnit: businessUnitId,
          subPath: Routes.Sales,
          id: undefined,
        }),
      },
      {
        content: 'Accounting',
        to: pathToUrl(Paths.ReportsModule.Reports, {
          businessUnit: businessUnitId,
          subPath: Routes.Accounting,
          id: undefined,
        }),
      },
      {
        content: 'Profitability',
        to: pathToUrl(Paths.ReportsModule.Reports, {
          businessUnit: businessUnitId,
          subPath: Routes.Profitability,
          id: undefined,
        }),
      },
      {
        content: 'Custom Reports',
        to: pathToUrl(Paths.ReportsModule.Reports, {
          businessUnit: businessUnitId,
          subPath: Routes.CustomReports,
          id: undefined,
        }),
      },
    ],
    [businessUnitId],
  );
};
