import React from 'react';
import { Redirect } from 'react-router-dom';

import { RouteModules } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext } from '@root/hooks';

export const BusinessUnitRedirect = () => {
  const { businessUnitId } = useBusinessContext();

  const url = pathToUrl(RouteModules.BusinessUnit, {
    businessUnit: businessUnitId,
  });

  return <Redirect to={url} />;
};
