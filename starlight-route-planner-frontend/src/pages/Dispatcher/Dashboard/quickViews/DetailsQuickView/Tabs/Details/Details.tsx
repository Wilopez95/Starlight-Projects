import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { uniq } from 'lodash-es';

import { WarningPreview } from '@root/common';
import { Divider } from '@root/common/TableTools';
import {
  isDailyRouteDriverNonUnique,
  isDailyRouteTruckNonUnique,
  isRouteDriverInactive,
  isRouteTruckInactive,
} from '@root/helpers';
import { useStores, useTimeZone, useTruckDriver } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IDashboardDailyRoute } from '@root/types';

import { DetailsItem } from './DetailsItem';

const I18N_PATH_ROOT = 'Text.';
const I18N_PATH_VALIDATION = 'ValidationErrors.';

interface IProps {
  dailyRoute: IDashboardDailyRoute;
}

export const DetailsTab: React.FC<IProps> = ({ dailyRoute }) => {
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();
  const { materialStore, serviceAreaStore, dashboardStore } = useStores();
  const { timeZone } = useTimeZone();

  const {
    driverId,
    serviceDate,
    completedAt,
    clockIn,
    clockOut,
    truckId,
    odometerStart,
    odometerEnd,
    workOrders,
  } = dailyRoute;

  const { driver, truck } = useTruckDriver({ truckId, driverId });

  const uniqueMaterialIds = useMemo(() => {
    return uniq(
      (dailyRoute.weightTickets ?? []).map(({ materialId }) => materialId).filter(Boolean),
    ) as number[];
  }, [dailyRoute.weightTickets]);

  const materials = useMemo(() => {
    if (uniqueMaterialIds.length === 0) {
      return;
    }

    const materialsMapped = uniqueMaterialIds.map(id => {
      return materialStore.getById(id)?.description;
    });

    return materialsMapped.length > 1 ? materialsMapped.join(', ') : materialsMapped[0];
  }, [uniqueMaterialIds, materialStore]);

  const serviceAreas = useMemo(() => {
    const uniqueServiceAreaIds = [
      ...new Set(workOrders.map(wo => wo.serviceAreaId).filter(Boolean)),
    ];

    if (uniqueServiceAreaIds.length === 0) {
      return;
    }

    const serviceAreasMapped = uniqueServiceAreaIds.map(id => serviceAreaStore.getById(id)?.name);

    return serviceAreasMapped.length > 1 ? serviceAreasMapped.join(', ') : serviceAreasMapped[0];
  }, [serviceAreaStore, workOrders]);

  const formattedServiceDate = useMemo(() => {
    return formatDateTime(new Date(serviceDate)).popupDate;
  }, [serviceDate, formatDateTime]);

  const formattedCompletedOn = useMemo(() => {
    return completedAt ? formatDateTime(new Date(completedAt), { timeZone }).popupDate : undefined;
  }, [completedAt, timeZone, formatDateTime]);

  const formattedClockIn = useMemo(() => {
    return clockIn ? formatDateTime(new Date(+clockIn), { timeZone }).time : undefined;
  }, [clockIn, timeZone, formatDateTime]);

  const formattedClockOut = useMemo(() => {
    return clockOut ? formatDateTime(new Date(+clockOut), { timeZone }).time : undefined;
  }, [clockOut, timeZone, formatDateTime]);

  const [inactiveDriver, inactiveTruck, nonUniqueDriver, nonUniqueTruck] = useMemo(
    () => [
      isRouteDriverInactive(dailyRoute),
      isRouteTruckInactive(dailyRoute),
      isDailyRouteDriverNonUnique(dailyRoute),
      isDailyRouteTruckNonUnique(dailyRoute),
    ],
    [dailyRoute],
  );

  return (
    <Layouts.Padding top="1" bottom="1">
      <DetailsItem marginTop="1" title={t(`${I18N_PATH_ROOT}ServiceArea`)} value={serviceAreas} />
      <DetailsItem marginTop="2" title={t(`${I18N_PATH_ROOT}Material`)} value={materials} />
      <Layouts.Margin top="2">
        <Layouts.Flex alignItems="center">
          <DetailsItem marginTop="0" title={t(`${I18N_PATH_ROOT}Driver`)} value={driver?.name} />
          {(inactiveDriver || nonUniqueDriver) && (
            <Layouts.Margin left="0.5">
              <WarningPreview
                text={t(
                  `${I18N_PATH_VALIDATION}${
                    inactiveDriver ? 'RouteInactiveDriver' : 'RouteNonUniqueDriver'
                  }`,
                )}
              />
            </Layouts.Margin>
          )}
        </Layouts.Flex>
      </Layouts.Margin>

      <DetailsItem
        marginTop="2"
        title={t(`${I18N_PATH_ROOT}ScheduledOn`)}
        value={formattedServiceDate}
      />
      <DetailsItem
        marginTop="2"
        title={t(`${I18N_PATH_ROOT}CompletedOn`)}
        value={formattedCompletedOn}
      />

      <Layouts.Margin top="3" />
      <Divider />

      <DetailsItem marginTop="3" title={t(`${I18N_PATH_ROOT}ClockIn`)} value={formattedClockIn} />
      <DetailsItem marginTop="2" title={t(`${I18N_PATH_ROOT}ClockOut`)} value={formattedClockOut} />
      <Layouts.Margin top="2">
        <Layouts.Flex alignItems="center">
          <DetailsItem marginTop="0" title={t(`${I18N_PATH_ROOT}TruckId`)} value={truck?.name} />
          {(inactiveTruck || nonUniqueTruck) && (
            <Layouts.Margin left="0.5">
              <WarningPreview
                text={t(
                  `${I18N_PATH_VALIDATION}${
                    inactiveTruck ? 'RouteInactiveTruck' : 'RouteNonUniqueTruck'
                  }`,
                )}
              />
            </Layouts.Margin>
          )}
        </Layouts.Flex>
      </Layouts.Margin>
      <DetailsItem
        marginTop="2"
        title={t(`${I18N_PATH_ROOT}OdometerStart`)}
        value={odometerStart}
      />
      <DetailsItem marginTop="2" title={t(`${I18N_PATH_ROOT}OdometerEnd`)} value={odometerEnd} />

      <Layouts.Margin top="3" />
      <Divider />
      <Layouts.Margin top="3" />
      <Layouts.Flex>
        <Layouts.Margin right="2">
          <Layouts.Box width="130px">
            <Typography color="secondary" shade="light">
              {t(`${I18N_PATH_ROOT}TicketNumber`)}
            </Typography>
          </Layouts.Box>
        </Layouts.Margin>
        <div>
          {dailyRoute.weightTickets?.map((weightTicket, index) => {
            return (
              <Layouts.Margin top={index === 0 ? '0' : '1'} key={weightTicket.id}>
                <Typography
                  color="information"
                  onClick={() =>
                    dashboardStore.toggleWeightTicketDetails({
                      weightTickets: dailyRoute.weightTickets,
                      initialIndex: index,
                      materialIds: uniqueMaterialIds,
                    })
                  }
                >
                  {weightTicket.ticketNumber}
                </Typography>
              </Layouts.Margin>
            );
          })}
        </div>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};
