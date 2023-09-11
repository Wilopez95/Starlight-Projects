import React, { FC } from 'react';
import { RouteProps, Route } from 'react-router';
import { ProtectedProps, Protected } from './Protected';

export interface ProtectedRouteProps extends RouteProps, ProtectedProps {}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  permissions,
  fallback,
  ...routeProps
}) => {
  return (
    <Protected permissions={permissions} fallback={fallback}>
      <Route {...routeProps} />
    </Protected>
  );
};
