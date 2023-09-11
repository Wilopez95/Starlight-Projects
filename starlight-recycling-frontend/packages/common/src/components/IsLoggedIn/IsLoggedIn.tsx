import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import { IsLoggedInResponse, IS_LOGGED_IN_QUERY } from '../../graphql/queries/user';

export interface IsLoggedInProps {}

const IsLoggedIn: FC = ({ children }) => {
  const { data } = useQuery<IsLoggedInResponse>(IS_LOGGED_IN_QUERY);

  if (!data || !data.isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};

export default IsLoggedIn;
