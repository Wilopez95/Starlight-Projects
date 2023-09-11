import { useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router';

import { Params, Routes } from '@root/consts';

const businessUnitParam = Params.businessUnit.replace(':', '');

export const BusinessUnitRedirect = () => {
  const history = useHistory();
  const routeParams = useParams<Record<string, string | undefined>>();

  const businessUnit = useMemo(() => routeParams[businessUnitParam] ?? '', [routeParams]);

  useEffect(() => {
    history.replace(`/${Routes.BusinessUnits}/${businessUnit}`);
  }, [businessUnit, history]);

  return null;
};
