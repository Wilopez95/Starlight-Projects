import React, { FC, useCallback, useState } from 'react';
import { gql } from '@apollo/client';
import { Trans, useTranslation } from '../../i18n';
import { ConfirmDeleteModal, showError, showSuccess } from '@starlightpro/common';

import {
  GetOrdersIndexedWithYardConsoleAggregationQuery,
  useBulkRemoveOrderMutation,
} from '../../graphql/api';
import { buildFetchVariables } from './config';
import { useDefaultColumns } from './defaultColumns';
import { closeModal, openModal } from '../../components/Modals';
import { YardOperationConsoleTabs } from './constants';
import { Box, Button } from '@material-ui/core';
import { refreshYardOperationConsole } from './refreshYardOperationConsole';
import YardOperationConsoleGrid, {
  YardOperationConsoleGridProps,
} from './YardOperationConsoleGrid';

export const BULK_REMOVE_ORDER = gql`
  mutation bulkRemoveOrder($ids: [Int!]!) {
    bulkRemoveOrder(ids: $ids)
  }
`;

export interface YardOperationConsoleOnTheWayProps
  extends Pick<YardOperationConsoleGridProps, 'customToolbar' | 'formContainer'> {
  openWeightTicketPreview: (orderId: number) => void;
}

type GridOrders = GetOrdersIndexedWithYardConsoleAggregationQuery['ordersIndexed']['data'];

export const YardOperationConsoleOnTheWay: FC<YardOperationConsoleOnTheWayProps> = ({
  customToolbar,
  openWeightTicketPreview,
  formContainer,
}) => {
  const [t] = useTranslation();
  const [bulkRemoveOrder] = useBulkRemoveOrderMutation();
  const [selectedOrders, setSelectedOrders] = useState<GridOrders>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const columns = useDefaultColumns({
    activeTab: YardOperationConsoleTabs.OnTheWay,
    openWeightTicketPreview,
  });
  const handleRemove = async () => {
    const singleOrder = selectedOrders.length === 1;
    const selectedIds = selectedOrders.map(({ id }) => id);
    const singleOrderId = selectedIds[0];

    openModal({
      content: (
        <ConfirmDeleteModal
          title={<Trans>Delete Order</Trans>}
          description={
            singleOrder ? (
              <Trans values={{ singleOrderId }}>
                Please confirm #<b>{{ singleOrderId }}</b> order deletion.
              </Trans>
            ) : (
              <Trans>Please confirm selected orders deletion.</Trans>
            )
          }
          deleteLabel={<Trans>Confirm</Trans>}
          onCancel={closeModal}
          onDelete={async () => {
            try {
              await bulkRemoveOrder({ variables: { ids: selectedIds } });
              closeModal();
              showSuccess(t(`Order${singleOrder ? '' : 's'} has been deleted!`));

              await refreshYardOperationConsole();
            } catch (e) {
              showError(t(`Could not delete order${singleOrder ? '' : 's'}!`));
            }

            setSelectedIndexes([]);
            setSelectedOrders([]);
          }}
        />
      ),
    });
  };

  const buildFetchVariablesCallback: typeof buildFetchVariables = useCallback(
    ({ perPage, currentSort, filter, query }) =>
      buildFetchVariables({
        activeTab: YardOperationConsoleTabs.OnTheWay,
        perPage,
        currentSort,
        filter,
        query,
      }),
    [],
  );

  return (
    <YardOperationConsoleGrid
      formContainer={formContainer}
      title={
        <Box display="flex" justifyContent="space-between">
          <Trans>Trucks On the Way</Trans>
          {!!selectedOrders.length && (
            <Button variant="contained" color="secondary" onClick={handleRemove}>
              <Trans>Remove Selected</Trans>
            </Button>
          )}
        </Box>
      }
      columns={columns}
      selectableRows="multiple"
      selectableRowsHeader
      selectableRowsHideCheckboxes={false}
      searchPlaceholder={t('Search Customer or Truck#')}
      customToolbar={customToolbar}
      buildFetchVariables={buildFetchVariablesCallback}
      selectedIndexes={selectedIndexes}
      onRowsSelected={(indexes, selectedOrders) => {
        setSelectedIndexes(indexes);
        setSelectedOrders(selectedOrders);
      }}
    />
  );
};

export default YardOperationConsoleOnTheWay;
