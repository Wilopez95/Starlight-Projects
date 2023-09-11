import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InNewWindowIcon, Layouts, Typography } from '@starlightpro/shared-components';

import { EmptyValuePlaceholder } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { WorkOrderStatus } from '@root/consts/workOrder';
import { getHaulingRedirectUrl, getParentOrderPath, pathToUrl } from '@root/helpers';
import { useBusinessContext, useTimeZone, useTruckDriver } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { Link } from '../styles';
import { ITabs } from '../types';

import { CancellationReasonWarning, MediaFilesSection } from './components';

const I18N_PATH_ROOT = 'Text.';

export const DetailsTab: React.FC<ITabs> = ({ workOrder, onEdit }) => {
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const getRedirectUrl = useMemo(() => getHaulingRedirectUrl(window.location.hostname), []);
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();

  const {
    serviceDate,
    dailyRoute,
    completedAt,
    orderDisplayId,
    instructionsForDriver,
    cancellationReason,
    cancellationComment,
    media,
    pickedUpEquipment,
    droppedEquipment,
    weight,
    weightUnit,
    isIndependent,
    thirdPartyHaulerDescription,
  } = workOrder;

  const { driverName, truckId } = dailyRoute ?? {};

  const { truck } = useTruckDriver({ truckId });

  const formattedServiceDate = useMemo(() => {
    return formatDateTime(new Date(serviceDate)).popupDate;
  }, [serviceDate, formatDateTime]);

  const dailyRouteUrl = useMemo(() => {
    if (!dailyRoute) {
      return '';
    }

    return pathToUrl(Paths.DispatchModule.DailyRoute, {
      businessUnit: businessUnitId,
      id: dailyRoute.id,
    });
  }, [dailyRoute, businessUnitId]);

  const masterRoute = dailyRoute?.parentRoute;

  const masterRouteUrl = useMemo(() => {
    if (!masterRoute) {
      return '';
    }

    return pathToUrl(Paths.DispatchModule.MasterRoute, {
      businessUnit: businessUnitId,
      id: masterRoute.id,
    });
  }, [businessUnitId, masterRoute]);

  const parentOrderUrl = useMemo(() => {
    const parentOrderPath = getParentOrderPath(workOrder, businessUnitId);

    return parentOrderPath ? getRedirectUrl(parentOrderPath) : undefined;
  }, [workOrder, businessUnitId, getRedirectUrl]);

  return (
    <>
      {workOrder.status === WorkOrderStatus.CANCELED && cancellationReason && (
        <CancellationReasonWarning
          cancellationReason={cancellationReason}
          cancellationComment={cancellationComment}
          onEdit={onEdit}
        />
      )}
      <Layouts.Padding top="2" bottom="2">
        <Layouts.Grid columns="160px auto" rowGap="1">
          <>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH_ROOT}3pHauler`)}
            </Typography>
            {thirdPartyHaulerDescription ? (
              <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                {thirdPartyHaulerDescription}
              </Typography>
            ) : (
              <EmptyValuePlaceholder />
            )}
          </>
          <>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH_ROOT}DailyRouteNumber`)}
            </Typography>
            {dailyRoute ? (
              <Link href={dailyRouteUrl} target="_blank">
                {dailyRoute.id}
              </Link>
            ) : (
              <EmptyValuePlaceholder />
            )}
          </>
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}ServiceDate`)}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {formattedServiceDate}
          </Typography>

          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}CompletedAt`)}
          </Typography>
          {completedAt ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {formatDateTime(new Date(completedAt), { timeZone }).completedOn}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}

          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}DriverName`)}
          </Typography>
          {driverName ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {driverName}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}TruckId`)}
          </Typography>
          {truck ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {truck.name}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}
          {!isIndependent && (
            <>
              <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                {t(`${I18N_PATH_ROOT}MasterRoute`)}
              </Typography>
              {masterRoute ? (
                <Link href={masterRouteUrl} target="_blank">
                  {masterRoute.name}
                </Link>
              ) : (
                <EmptyValuePlaceholder />
              )}
            </>
          )}
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}ParentOrderNumber`)}
          </Typography>
          {orderDisplayId ? (
            <Layouts.Flex>
              <Link href={parentOrderUrl} target="_blank">
                {orderDisplayId}
              </Link>
              <Layouts.Margin right="0.5" />
              <InNewWindowIcon />
            </Layouts.Flex>
          ) : (
            <EmptyValuePlaceholder />
          )}
        </Layouts.Grid>
      </Layouts.Padding>
      <Divider />
      <Layouts.Margin top="2" bottom="2">
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH_ROOT}InstructionsForDriver`)}
        </Typography>
        <Layouts.Margin top="1">
          {instructionsForDriver ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {instructionsForDriver}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}
        </Layouts.Margin>
      </Layouts.Margin>
      <Divider />
      <MediaFilesSection previewCount={3} media={media} />
      <Layouts.Margin top="2">
        <Layouts.Grid columns="160px auto" rowGap="1">
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}EquipmentNumber`)}
          </Typography>
          {pickedUpEquipment ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {pickedUpEquipment}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}DroppedEquipmentNumber`)}
          </Typography>
          {droppedEquipment ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {droppedEquipment}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {`${t(`${I18N_PATH_ROOT}Weight`)} ${weightUnit ? `(${weightUnit})` : ''}`}
          </Typography>
          {weight ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {weight}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}
        </Layouts.Grid>
      </Layouts.Margin>
    </>
  );
};
