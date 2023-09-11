import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import * as History from 'history';

interface P {
  to: string;
}

const DefaultRedirect: React.FC<P> = ({ to }) => {
  const location = useLocation<{ redirectedFrom?: string }>();
  let path: History.LocationDescriptor;

  if (location.state?.redirectedFrom) {
    path = { ...location, pathname: location.state.redirectedFrom, state: {} };
  } else {
    path = { ...location, pathname: to, state: { redirectedFrom: location.pathname } };
  }

  return <Redirect to={path} />;
};

export default DefaultRedirect;
