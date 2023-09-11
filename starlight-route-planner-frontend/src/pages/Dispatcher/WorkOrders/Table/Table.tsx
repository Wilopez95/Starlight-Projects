import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { StatusBadge } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableScrollContainer,
} from '@root/common/TableTools';
import { formatAddress, hasDataAttribute } from '@root/helpers';
import { useBusinessContext, useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { WorkOrderTableHeader } from './TableHeader';
import { IWorkOrderTable } from './types';

const I18N_PATH = 'pages.Dispatcher.components.WorkOrders.Table.Text.';

export const WorkOrderTable: React.FC<IWorkOrderTable> = observer(({ handleWorkOrderClick }) => {
  const { t } = useTranslation();
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const { workOrdersStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();
  const canEffectDateChanges = useRef(false);

  const request = useCallback(
    async (reset = false) => {
      await workOrdersStore.getWorkOrdersList(
        businessUnitId,
        {
          thirdPartyHaulerIds: workOrdersStore.thirdPartyHaulerIds,
          assignedRoute: workOrdersStore.assignedRoute,
          businessLineIds: workOrdersStore.businessLineIds,
          serviceAreaIds: workOrdersStore.serviceAreaIds,
          status: workOrdersStore.status,
        },
        {
          cleanUp: reset,
          resetOffset: reset,
        },
      );

      canEffectDateChanges.current = true;
    },
    [businessUnitId, workOrdersStore],
  );

  useEffect(() => {
    if (canEffectDateChanges.current) {
      request(true);
    }
  }, [workOrdersStore.serviceDate, request]);

  const handleWorkOrderSelection = useCallback(
    (id: number) => {
      workOrdersStore.toggleWOSelection(id);
    },
    [workOrdersStore],
  );

  const loadMore = useCallback(() => {
    request();
  }, [request]);

  return (
    <TableScrollContainer ref={tableContainerRef}>
      <Table>
        <WorkOrderTableHeader tableContainerRef={tableContainerRef} loadMore={loadMore} />
        <TableBody loading={workOrdersStore.loading} noResult={workOrdersStore.noResult} cells={9}>
          {workOrdersStore.values.map(workOrder => (
            <TableRow
              key={workOrder.id}
              onClick={e => {
                if (hasDataAttribute(e, 'skipEvent')) {
                  return;
                }
                handleWorkOrderClick(workOrder.displayId);
              }}
            >
              <TableCell>
                <Checkbox
                  name={`workOrder-${workOrder.id}`}
                  onChange={() => {
                    handleWorkOrderSelection(workOrder.id);
                  }}
                  value={workOrdersStore.workOrdersSelects.has(workOrder.id)}
                />
                <Layouts.Padding left="1">
                  <Typography variant="bodyMedium" color="information" shade="standard">
                    {workOrder.displayId}
                  </Typography>
                </Layouts.Padding>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {workOrder.assignedRoute ?? '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {workOrder.thirdPartyHaulerDescription ?? '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {workOrder.completedAt
                    ? formatDateTime(new Date(workOrder.completedAt), {
                        timeZone,
                      }).completedOn
                    : '-'}
                </Typography>
              </TableCell>
              <TableCell center>
                <Checkbox
                  name={`work-order-${workOrder.id}`}
                  onChange={noop}
                  disabled
                  value={!!workOrder.instructionsForDriver}
                />
              </TableCell>
              <TableCell center>
                <Checkbox
                  name={`work-order-${workOrder.id}`}
                  onChange={noop}
                  disabled
                  value={!!workOrder.comments?.length}
                />
              </TableCell>
              <TableCell center>
                <Checkbox
                  name={`work-order-${workOrder.id}`}
                  onChange={noop}
                  disabled
                  value={!!workOrder.media?.length}
                />
              </TableCell>
              <TableCell>
                <StatusBadge status={workOrder.status} routeType="work-orders" />
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {formatAddress(workOrder.jobSite.address)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        loaded={workOrdersStore.loaded}
        loading={workOrdersStore.loading}
        onLoaderReached={loadMore}
      >
        {t(`${I18N_PATH}LoadMore`)}
      </TableInfiniteScroll>
    </TableScrollContainer>
  );
});
