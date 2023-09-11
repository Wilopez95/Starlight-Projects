import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Tooltip, Typography } from '@starlightpro/shared-components';
import { uniq } from 'lodash-es';

import { DailyRouteStatusBadge, WarningPreview } from '@root/common';
import { TableCell, TableRow as TableRowBase } from '@root/common/TableTools';
import { getBusinessLineNameByType } from '@root/consts';
import { useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IDashboardDailyRoute } from '@root/types';

import { TicketIcon } from './styles';

const I18N_PATH_VALIDATION = 'ValidationErrors.';

interface IProps {
  dailyRoute: IDashboardDailyRoute;
  handleDailyRouteClick(id: number): void;
}

export const TableRow: React.FC<IProps> = ({ dailyRoute, handleDailyRouteClick }) => {
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();
  const { dashboardStore } = useStores();

  const hasViolations = useMemo(() => {
    return dailyRoute.violation?.length ?? dailyRoute.uniqueAssignmentViolation?.length ?? false;
  }, [dailyRoute]);

  const uniqueMaterialIds = useMemo(() => {
    return uniq(
      (dailyRoute.weightTickets ?? []).map(({ materialId }) => materialId).filter(Boolean),
    ) as number[];
  }, [dailyRoute.weightTickets]);

  return (
    <TableRowBase key={dailyRoute.id} onClick={() => handleDailyRouteClick(dailyRoute.id)}>
      <TableCell>
        <Layouts.Flex alignItems="center">
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {dailyRoute.name}
          </Typography>
          {hasViolations ? (
            <Layouts.Margin left="0.5">
              <WarningPreview text={t(`${I18N_PATH_VALIDATION}RouteGeneric`)} />
            </Layouts.Margin>
          ) : null}
        </Layouts.Flex>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.businessLineType ? (
            <Tooltip
              position="top"
              text={t(getBusinessLineNameByType(dailyRoute.businessLineType))}
            >
              {dailyRoute.businessLineType}
            </Tooltip>
          ) : null}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.numberOfStops}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.numberOfWos}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.completedAt
            ? formatDateTime(new Date(dailyRoute.completedAt), { timeZone }).completedOn
            : '-'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.driverName}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.truckId}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.truckType}
        </Typography>
      </TableCell>
      <TableCell center>
        {dailyRoute.weightTickets && dailyRoute.weightTickets.length > 0 ? (
          <Typography
            variant="bodyMedium"
            color="secondary"
            shade="light"
            textAlign="center"
            onClickCapture={e => {
              e.stopPropagation();
              dashboardStore.toggleWeightTicketDetails({
                weightTickets: dailyRoute.weightTickets,
                materialIds: uniqueMaterialIds,
              });
            }}
          >
            <TicketIcon />
          </Typography>
        ) : null}
      </TableCell>
      <TableCell>
        <DailyRouteStatusBadge status={dailyRoute.status} editingBy={dailyRoute.editingBy} />
      </TableCell>
      <TableCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {dailyRoute.completionRate}%
        </Typography>
      </TableCell>
    </TableRowBase>
  );
};
