import React from 'react';

import * as Styles from './styles';

interface IRouteColorPreview {
  color: string;
}

export const RouteColorPreview: React.FC<IRouteColorPreview> = ({ color }) => (
  <Styles.Wrapper color={color} />
);
