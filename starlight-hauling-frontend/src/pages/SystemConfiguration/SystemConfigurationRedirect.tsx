import React from 'react';
import { Redirect } from 'react-router-dom';

import { Routes } from '@root/consts';

export const SystemConfigurationRedirect = () => {
  return <Redirect to={`/${Routes.Configuration}`} />;
};
