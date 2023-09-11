import React from 'react';
import { showError } from '@starlightpro/common';

import { Trans } from '../../i18n';

export let refetchYardOperationConsoleQuery: () => void = () => {};

export const refreshYardOperationConsole = () => {
  try {
    refetchYardOperationConsoleQuery();
  } catch (e) {
    showError(<Trans>Failed to refresh yard operation console</Trans>);
  }
};

export const setRefetchYardOperationConsoleQuery = (
  query: typeof refetchYardOperationConsoleQuery,
) => {
  refetchYardOperationConsoleQuery = query;
};
