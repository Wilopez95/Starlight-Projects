import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapGL, { Marker } from 'react-map-gl';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/common/TableTools';
import { accessToken, defaultMapStyle, defaultZoom } from '@root/config/mapbox';
import { BusinessLineType } from '@root/consts';
import { formatAddress } from '@root/helpers';
import { useDateTime, useStores } from '@root/hooks';

import { ITabs } from '../types';

import { NoteWrapper, StyledMarker } from './styles';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'quickViews.WorkOrderView.JobSiteTab.Text.';

interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
  width?: number;
  height?: number;
}

export const JobSiteTab: React.FC<ITabs> = observer(({ workOrder }) => {
  const { t } = useTranslation();
  const { customerStore, businessLineStore } = useStores();

  const businessLine = businessLineStore.getById(workOrder.businessLineId);

  const isCommertial = businessLine?.type === BusinessLineType.commercialWaste;
  const isResidential = businessLine?.type === BusinessLineType.residentialWaste;
  const isPT = businessLine?.type === BusinessLineType.portableToilets;

  const [longitude, latitude] = workOrder.jobSite.coordinates;
  const { formatDateTime } = useDateTime();
  const [viewport, setViewport] = useState<Viewport>({
    latitude,
    longitude,
    zoom: defaultZoom,
    bearing: 0,
    pitch: 0,
  });

  useEffect(() => {
    if (!workOrder.customerId) {
      return;
    }

    customerStore.requestById(workOrder.customerId);
  }, [workOrder.customerId, customerStore]);

  const customerName = useMemo(() => {
    if (!customerStore.currentCustomer) {
      return '';
    }

    const { mainFirstName = '', mainLastName = '' } = customerStore.currentCustomer;

    return `${mainFirstName} ${mainLastName}`;
  }, [customerStore.currentCustomer]);

  return (
    <>
      {workOrder.jobSiteNote && (
        <NoteWrapper>
          <Layouts.Padding padding="2">
            <Typography variant="bodyMedium" color="secondary" shade="light">
              {t(`${I18N_PATH}Note`)}
            </Typography>
            <Layouts.Margin top="0.5" />
            <Typography variant="bodyMedium" color="default" shade="dark">
              {workOrder.jobSiteNote}
            </Typography>
          </Layouts.Padding>
        </NoteWrapper>
      )}
      <Layouts.Margin top="2" />
      <MapGL
        mapStyle={defaultMapStyle}
        onViewportChange={(viewportEvent: Viewport) => setViewport(viewportEvent)}
        mapboxApiAccessToken={accessToken}
        width="100%"
        height="205px"
        {...viewport}
      >
        <Marker latitude={latitude} longitude={longitude} offsetLeft={-20} offsetTop={-10}>
          <StyledMarker />
        </Marker>
      </MapGL>
      <Layouts.Margin top="2" />
      <Layouts.Grid columns="140px auto" rowGap="1">
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_ROOT_PATH}JobSite`)}
        </Typography>
        <Typography variant="bodyMedium" color="default" shade="dark">
          {formatAddress(workOrder.jobSite.address)}
        </Typography>
        {customerName && (
          <>
            <Typography variant="bodyMedium" color="secondary" shade="light">
              {t(`${I18N_PATH}JobSiteContact`)}
            </Typography>
            <Typography variant="bodyMedium" color="default" shade="dark">
              {customerName}
            </Typography>
          </>
        )}
        {workOrder.phoneNumber && (
          <>
            <Typography variant="bodyMedium" color="secondary" shade="light">
              {t(`${I18N_ROOT_PATH}Phone`)}
            </Typography>
            <Typography variant="bodyMedium" color="default" shade="dark">
              {workOrder.phoneNumber}
            </Typography>
          </>
        )}
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_ROOT_PATH}BestTimeToCome`)}
        </Typography>
        <Typography variant="bodyMedium" color="default" shade="dark">
          {formatDateTime({
            from: workOrder.bestTimeToComeFrom,
            to: workOrder.bestTimeToComeTo,
          })}
        </Typography>
      </Layouts.Grid>
      <Layouts.Margin top="2" />
      <Divider />
      <Layouts.Margin top="2" />
      <Layouts.Grid columns="auto auto" rowGap="1">
        {(isCommertial || isResidential || isPT) && (
          <>
            <Checkbox name="1" onChange={noop} disabled value={workOrder.alleyPlacement}>
              <Typography variant="bodyMedium" color="secondary" shade="light">
                {t(`${I18N_ROOT_PATH}AlleyPlacement`)}
              </Typography>
            </Checkbox>
            <Checkbox name="1" onChange={noop} disabled value={workOrder.highPriority}>
              <Typography variant="bodyMedium" color="secondary" shade="light">
                {t(`${I18N_ROOT_PATH}HighPriority`)}
              </Typography>
            </Checkbox>
            <Checkbox name="1" onChange={noop} disabled value={workOrder.poRequired}>
              <Typography variant="bodyMedium" color="secondary" shade="light">
                {t(`${I18N_ROOT_PATH}PoRequired`)}
              </Typography>
            </Checkbox>
          </>
        )}
        {(isCommertial || isPT) && (
          <>
            <Checkbox name="1" onChange={noop} disabled value={workOrder.signatureRequired}>
              <Typography variant="bodyMedium" color="secondary" shade="light">
                {t(`${I18N_ROOT_PATH}SignatureRequired`)}
              </Typography>
            </Checkbox>
            <Checkbox name="1" onChange={noop} disabled value={workOrder.someoneOnSite}>
              <Typography variant="bodyMedium" color="secondary" shade="light">
                {t(`${I18N_ROOT_PATH}SomeoneOnSite`)}
              </Typography>
            </Checkbox>
          </>
        )}
        {isPT && (
          <>
            <Checkbox name="1" onChange={noop} disabled value={workOrder.permitRequired}>
              <Typography variant="bodyMedium" color="secondary" shade="light">
                {t(`${I18N_ROOT_PATH}PermitRequired`)}
              </Typography>
            </Checkbox>
            <Checkbox name="1" onChange={noop} disabled value={workOrder.toRoll}>
              <Typography variant="bodyMedium" color="secondary" shade="light">
                {t(`${I18N_ROOT_PATH}ToRoll`)}
              </Typography>
            </Checkbox>
          </>
        )}
      </Layouts.Grid>
    </>
  );
});
