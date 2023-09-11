import React from 'react';
import { Redirect } from 'react-router';
import { useRouteMatch } from 'react-router-dom';

import { customerPath, Paths } from '@root/core/consts';
import { pathToUrl } from '@root/core/helpers';

export const DefaultAuthenticatedRedirect = () => {
  const match = useRouteMatch<{ customerId: string }>(customerPath);

  if (match) {
    return (
      <Redirect
        to={pathToUrl(Paths.Profile, {
          customerId: match.params.customerId,
        })}
      />
    );
  }

  return <Redirect to={Paths.Lobby} />;
};
