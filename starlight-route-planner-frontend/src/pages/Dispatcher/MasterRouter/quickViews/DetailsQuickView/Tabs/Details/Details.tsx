import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { WarningPreview } from '@root/common';
import { isRouteDriverInactive, isRouteTruckInactive } from '@root/helpers';
import { useTruckDriver } from '@root/hooks';

import { MasterRouteDriverTruck } from '../types';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'quickViews.MasterRouteDetailsView.Text.';
const I18N_PATH_VALIDATION = 'ValidationErrors.';

export const DetailsTab: React.FC<MasterRouteDriverTruck> = ({ ...route }) => {
  const { t } = useTranslation();

  const { driver, truck } = useTruckDriver({
    truckId: route.truckId,
    driverId: route.driverId,
  });

  const [inactiveDriver, inactiveTruck] = useMemo(
    () => [isRouteDriverInactive(route), isRouteTruckInactive(route)],
    [route],
  );

  return (
    <>
      <Layouts.Flex>
        <Layouts.Box width="112px">
          <Typography color="secondary" shade="light">
            {t(`${I18N_PATH}Driver`)}
          </Typography>
        </Layouts.Box>
        <Layouts.Flex alignItems="center">
          <Typography color="secondary" shade="dark">
            {driver?.name}
          </Typography>
          {inactiveDriver && (
            <Layouts.Margin left="0.5">
              <WarningPreview text={t(`${I18N_PATH_VALIDATION}RouteInactiveDriver`)} />
            </Layouts.Margin>
          )}
        </Layouts.Flex>
      </Layouts.Flex>
      <Layouts.Margin top="1" />
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
          {inactiveTruck && (
            <Layouts.Margin left="0.5">
              <WarningPreview text={t(`${I18N_PATH_VALIDATION}RouteInactiveTruck`)} />
            </Layouts.Margin>
          )}
        </Layouts.Flex>
      </Layouts.Flex>
    </>
  );
};
