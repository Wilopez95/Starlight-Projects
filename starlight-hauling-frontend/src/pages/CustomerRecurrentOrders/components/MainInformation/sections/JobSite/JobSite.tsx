import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { Banner, InteractiveMap, Marker, Typography } from '@root/common';
import { IMarkerHandle } from '@root/common/InteractiveMap/types';
import { Divider } from '@root/common/TableTools';
import { Order } from '@root/stores/entities';

import * as Styles from '../../styles';

const I18N_PATH = 'pages.CustomerRecurrentOrders.tables.MainInformation.sections.JobSite.Text.';

const JobSiteSection: React.FC = () => {
  const { values } = useFormikContext<
    Order & { receipts: { receiptPdfUrl?: string; receiptPreviewUrl?: string }[] }
  >();
  const marker = useRef<IMarkerHandle>(null);
  const timeoutHandle = useRef<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const didTransition = marker.current?.flyToThis();

    if (!didTransition) {
      timeoutHandle.current = window.setTimeout(() => {
        marker.current?.flyToThis();
      }, 3000);
    }
  }, [values.jobSite?.location]);

  useEffect(
    () => () => {
      if (timeoutHandle.current !== null) {
        window.clearTimeout(timeoutHandle.current);
      }
    },
    [],
  );

  const permitRequired = values?.customerJobSite?.permitRequired ?? false;
  const poRequired = values?.customerJobSite?.permitRequired ?? true;

  return (
    <Styles.JobSiteSectionLayout columns={1} rowGap="2">
      <Typography variant="bodyLarge" fontWeight="bold">
        {t(`${I18N_PATH}JobSite`)}
      </Typography>
      {values.customer?.popupNote ? <Banner>{values.customer.popupNote}</Banner> : null}
      <InteractiveMap position="relative" width="100%" height="220px">
        <Marker ref={marker} initialPosition={values.jobSite?.location} />
      </InteractiveMap>
      <Checkbox name="poRequired" onChange={noop} value={poRequired} disabled>
        {t(`${I18N_PATH}PONumberRequired`)}
      </Checkbox>
      <Checkbox name="permitRequired" onChange={noop} value={permitRequired} disabled>
        {t(`${I18N_PATH}PermitRequired`)}
      </Checkbox>
      <Divider bottom />
      {values.driverInstructions ? (
        <>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}InstructionsForDriver`)}
          </Typography>
          <div>{values.driverInstructions}</div>
        </>
      ) : null}
      <Typography color="secondary" shade="desaturated">
        {t(`${I18N_PATH}BestTimeToCome`)}
      </Typography>
      <div>
        {values.bestTimeToComeFrom}-{values.bestTimeToComeTo}
      </div>
      <Layouts.Grid columns={2} rowGap="2">
        <Checkbox name="someoneOnSite" onChange={noop} value={values.someoneOnSite} disabled>
          {t(`${I18N_PATH}SomeoneOnSite`)}
        </Checkbox>
        <Checkbox name="okToRoll" onChange={noop} value={values.toRoll} disabled>
          {t(`${I18N_PATH}OkToRoll`)}
        </Checkbox>
        <Checkbox
          name="signatureRequired"
          onChange={noop}
          value={values.customerJobSite?.signatureRequired ?? false}
          disabled
        >
          {t(`${I18N_PATH}SignatureRequired`)}
        </Checkbox>
        <Checkbox name="highPriority" onChange={noop} value={values.highPriority} disabled>
          {t(`${I18N_PATH}HighPriority`)}
        </Checkbox>
        <Checkbox name="earlyPickup" onChange={noop} value={values.earlyPick} disabled>
          {t(`${I18N_PATH}EarlyPickupIsOk`)}
        </Checkbox>
      </Layouts.Grid>
    </Styles.JobSiteSectionLayout>
  );
};

export default JobSiteSection;
