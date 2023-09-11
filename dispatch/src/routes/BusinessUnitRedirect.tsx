import { Redirect, useParams } from 'react-router-dom';

import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from './routing';

export type BusinessParams = {
  businessUnit: string;
};

export const BusinessUnitRedirect = () => {
  const { businessUnit: businessUnitId } = useParams<BusinessParams>();
  const url = pathToUrl(Paths.Dispatcher, {
    businessUnit: +businessUnitId,
  });

  return <Redirect to={url} />;
};
