import React, { FC } from 'react';
import { Trans, useTranslation } from '../../i18n';

import { buildFetchVariables } from './config';
import { useDefaultColumns } from './defaultColumns';
import { YardOperationConsoleTabs } from './constants';
import { Box } from '@material-ui/core';
import YardOperationConsoleGrid, {
  YardOperationConsoleGridProps,
} from './YardOperationConsoleGrid';

export interface YardOperationConsoleTodayProps
  extends Pick<YardOperationConsoleGridProps, 'customToolbar' | 'formContainer'> {
  openWeightTicketPreview: (orderId: number) => void;
}

export const YardOperationConsoleToday: FC<YardOperationConsoleTodayProps> = ({
  customToolbar,
  openWeightTicketPreview,
  formContainer,
}) => {
  const [t] = useTranslation();
  const columns = useDefaultColumns({
    activeTab: YardOperationConsoleTabs.Today,
    openWeightTicketPreview,
  });

  return (
    <YardOperationConsoleGrid
      formContainer={formContainer}
      title={
        <Box display="flex" justifyContent="space-between">
          <Trans>Today Activity</Trans>
        </Box>
      }
      columns={columns}
      searchPlaceholder={t('Search Ticket, Customer or Truck#')}
      customToolbar={customToolbar}
      buildFetchVariables={({ perPage, currentSort, filter, query }) =>
        buildFetchVariables({
          activeTab: YardOperationConsoleTabs.Today,
          perPage,
          currentSort,
          filter,
          query,
        })
      }
    />
  );
};

export default YardOperationConsoleToday;
