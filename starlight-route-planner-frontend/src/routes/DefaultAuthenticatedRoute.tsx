import React from 'react';
import { Redirect, useRouteMatch } from 'react-router';

import { Paths, RouteModules } from '@root/consts';
import { pathToUrl } from '@root/helpers';

export const DefaultAuthenticatedRedirect = () => {
  const match = useRouteMatch<{ businessUnit: string }>(RouteModules.businessUnit);

  if (match) {
    return (
      <Redirect
        to={pathToUrl(Paths.DispatchModule.MasterRoutes, {
          businessUnit: match.params.businessUnit,
        })}
      />
    );
  }

  return <Redirect to={Paths.Lobby} />;
};
