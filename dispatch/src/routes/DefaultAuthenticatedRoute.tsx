import { Redirect, useRouteMatch } from 'react-router-dom';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from './routing';

export const DefaultAuthenticatedRedirect = () => {
  const match = useRouteMatch<{ businessUnit: string }>(Paths.BusinessUnitPath);
  if (match) {
    return (
      <Redirect
        to={pathToUrl(Paths.Dispatcher, {
          businessUnit: match.params.businessUnit,
        })}
      />
    );
  }

  return <Redirect to={Paths.Lobby} />;
};
