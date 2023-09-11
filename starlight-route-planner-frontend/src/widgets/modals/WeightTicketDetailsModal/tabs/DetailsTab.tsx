import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { EmptyValuePlaceholder } from '@root/common';
import { useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { DetailsInfoWrapper } from '../styles';
import { ITabProps } from '../types';

const I18N_PATH = 'Text.';

export const DetailsTab: React.FC<ITabProps> = observer(({ weightTicket }) => {
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();
  const { materialStore, waypointsStore } = useStores();
  const waypoint = waypointsStore.getById(weightTicket.disposalSiteId);
  const materialInfo = materialStore.getById(weightTicket.materialId);

  return (
    <DetailsInfoWrapper>
      <Layouts.Grid columns="160px auto" rowGap="2">
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}FacilityName`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {waypoint?.description}
        </Typography>

        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}LoadValue`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {weightTicket.loadValue}
        </Typography>

        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Units`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {weightTicket.weightUnit}
        </Typography>

        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Material`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {materialInfo?.description ?? <EmptyValuePlaceholder />}
        </Typography>

        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}ArrivalTime`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {weightTicket.arrivalTime ? (
            formatDateTime(new Date(weightTicket.arrivalTime), { timeZone }).timeWithSeconds
          ) : (
            <EmptyValuePlaceholder />
          )}
        </Typography>

        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}DepartureTime`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {weightTicket.departureTime ? (
            formatDateTime(new Date(weightTicket.departureTime), { timeZone }).timeWithSeconds
          ) : (
            <EmptyValuePlaceholder />
          )}
        </Typography>

        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}TimeOnLandfill`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {weightTicket.timeOnLandfill ? (
            formatDateTime(new Date(weightTicket.timeOnLandfill)).time24WithSeconds
          ) : (
            <EmptyValuePlaceholder />
          )}
        </Typography>
      </Layouts.Grid>
    </DetailsInfoWrapper>
  );
});
