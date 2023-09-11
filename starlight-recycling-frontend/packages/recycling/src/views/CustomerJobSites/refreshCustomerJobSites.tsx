import React from 'react';
import { showRefresh } from '@starlightpro/common';

import { Trans } from '../../i18n';

let refetchCustomerJobSiteList: () => Promise<any> = () => Promise.resolve(null);

export const setRequestFn = (requestFn: () => Promise<any>) => {
  refetchCustomerJobSiteList = requestFn;
};

export const refreshCustomerJobSites = () =>
  showRefresh(
    {
      refreshMessage: <Trans>Refreshing customer job sites</Trans>,
      errorMessage: <Trans>Failed to refresh</Trans>,
    },
    new Promise((resolve, reject) => {
      setTimeout(() => {
        refetchCustomerJobSiteList().then(resolve, reject);
      }, 1500);
    }),
  );
