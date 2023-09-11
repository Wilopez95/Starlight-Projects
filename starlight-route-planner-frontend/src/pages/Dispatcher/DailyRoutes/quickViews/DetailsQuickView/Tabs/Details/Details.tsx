import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { WarningPreview } from '@root/common';
import {
  isDailyRouteDriverNonUnique,
  isDailyRouteTruckNonUnique,
  isRouteDriverInactive,
  isRouteTruckInactive,
} from '@root/helpers';
import { useTruckDriver } from '@root/hooks';

import { DailyRouteDriverTruck } from '../types';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH_VALIDATION = 'ValidationErrors.';
const I18N_PATH_ROUTE_DETAILS = 'quickViews.DailyRouteDetails.Text.';

export const DetailsTab: React.FC<DailyRouteDriverTruck> = ({ dailyRoute }) => {
  const { t } = useTranslation();

  const { driver, truck } = useTruckDriver({
    truckId: dailyRoute.truckId,
    driverId: dailyRoute.driverId,
  });

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
    <Layouts.Padding top="2" bottom="2">
      <Layouts.Margin top="1" />
      <Layouts.Flex>
        <Layouts.Box width="112px">
          <Typography color="secondary" shade="light">
            {t(`${I18N_PATH_ROUTE_DETAILS}Driver`)}
          </Typography>
        </Layouts.Box>
        <Layouts.Flex alignItems="center">
          <Typography color="secondary" shade="dark">
            {driver?.name}
          </Typography>
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
      </Layouts.Flex>
      <Layouts.Margin top="2" />
      <Layouts.Flex>
        <Layouts.Box width="112px">
          <Typography color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}TruckId`)}
          </Typography>
        </Layouts.Box>
        <Layouts.Flex alignItems="center">
          <Typography color="default" shade="dark">
            {truck?.name}
          </Typography>
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
      </Layouts.Flex>
    </Layouts.Padding>
  );
};
