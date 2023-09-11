import React, { createContext, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { GetUserDriverQuery, useGetUserDriverQuery } from '../../../../graphql/api';
import { showError } from '@starlightpro/common';
import { Trans } from '../../../../i18n';

gql`
  query getUserDriver {
    userDriver {
      id
      photoUrl
      businessUnits {
        id
      }
    }
  }
`;

type Driver = GetUserDriverQuery['userDriver'];

interface IDriverContext {
  driver: Driver | null;
  loading: boolean;
}

export const DriverContext = createContext<IDriverContext>({
  driver: null,
  loading: true,
});

export const DriverProvider: React.FC = ({ children }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const { data, error, loading, called } = useGetUserDriverQuery({
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    setDriver(data?.userDriver ?? null);
  }, [data]);

  useEffect(() => {
    if (!error && called && data?.userDriver !== null) {
      return;
    }

    showError(
      error?.message ?? <Trans>Failed to fetch driver data. Please, use driver account</Trans>,
    );
  }, [error, called, data]);

  return (
    <DriverContext.Provider
      value={{
        driver,
        loading,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};
