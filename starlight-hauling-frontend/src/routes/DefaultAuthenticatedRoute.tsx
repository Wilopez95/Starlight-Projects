import React, { useEffect, useState } from 'react';
import { Redirect, useRouteMatch } from 'react-router';

import { BusinessUnitService } from '@root/api';
import { OrderStatusRoutes, Paths, RouteModules } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { BusinessUnitType } from '@root/types';

const businessUnitService = new BusinessUnitService();

export const DefaultAuthenticatedRedirect = () => {
  const match = useRouteMatch<{ businessUnit: string }>(RouteModules.BusinessUnit);
  const [isRecyclingFacilityBU, setIsRecyclingFacilityBU] = useState<null | boolean>(null);

  useEffect(() => {
    if (match) {
      (async () => {
        const businessUnit = await businessUnitService.getById(+match.params.businessUnit);

        setIsRecyclingFacilityBU(businessUnit.type === BusinessUnitType.RECYCLING_FACILITY);
      })();
    } else {
      setIsRecyclingFacilityBU(false);
    }
  }, [match]);

  if (isRecyclingFacilityBU === null) {
    return null;
  }

  if (match) {
    return (
      <Redirect
        to={pathToUrl(Paths.OrderModule.Orders, {
          businessUnit: match.params.businessUnit,
          subPath: isRecyclingFacilityBU ? OrderStatusRoutes.All : OrderStatusRoutes.InProgress,
        })}
      />
    );
  }

  return <Redirect to={Paths.Lobby} />;
};
