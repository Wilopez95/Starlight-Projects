import React from 'react';
import { Redirect } from 'react-router-dom';

interface P {
  to: string;
}

const DefaultRedirect: React.FC<P> = ({ to }) => {
  // Consider adding logic to restore the initial navigation.
  return <Redirect to={to} />;
};

export default DefaultRedirect;
