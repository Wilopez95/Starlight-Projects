import React from 'react';

export interface IRoute {
  name: string;
  path: string;
  component: React.ReactNode;
  header?: boolean | string | React.FC;
  exact?: boolean;
}
