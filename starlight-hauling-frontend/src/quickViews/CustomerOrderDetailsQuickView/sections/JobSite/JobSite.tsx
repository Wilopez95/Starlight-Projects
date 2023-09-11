import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import {
  Banner,
  FilePreviewGallery,
  FilePreviewWithModal,
  InteractiveMap,
  Marker,
  Typography,
} from '@root/common';
import { IMarkerHandle } from '@root/common/InteractiveMap/types';
import { Divider } from '@root/common/TableTools';
import { Order } from '@root/stores/entities';
import { useIsRecyclingFacilityBU } from '@hooks';

import { JobSiteSectionLayout } from '../../styles';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.JobSite.Text.';

const JobSiteSection: React.FC = () => {
  const { values } = useFormikContext<
    Order & { receipts: { receiptPdfUrl?: string; receiptPreviewUrl?: string }[] }
  >();
  const marker = useRef<IMarkerHandle>(null);
  const timeoutHandle = useRef<number | null>(null);
  const { t } = useTranslation();
  const isRecyclingBU = useIsRecyclingFacilityBU();

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
    <JobSiteSectionLayout columns={1} rowGap="2">
      <Typography variant="bodyLarge" fontWeight="bold">
        {t(`${I18N_PATH}JobSite`)}
      </Typography>
      {values.customer?.popupNote ? <Banner>{values.customer.popupNote}</Banner> : null}
      <InteractiveMap position="relative" width="100%" height="220px">
        {values.jobSite?.location ? (
          <Marker ref={marker} initialPosition={values.jobSite.location} />
        ) : null}
      </InteractiveMap>
      <Checkbox name="poRequired" onChange={noop} value={poRequired} disabled>
        {t(`${I18N_PATH}PONumberRequired`)}
      </Checkbox>
      {!isRecyclingBU ? (
        <>
          <Checkbox name="permitRequired" onChange={noop} value={permitRequired} disabled>
            {t(`${I18N_PATH}PermitRequired`)}
          </Checkbox>
          <Divider bottom />
        </>
      ) : null}
      {values.driverInstructions ? (
        <>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}InstructionsForDriver`)}
          </Typography>
          <div>{values.driverInstructions}</div>
        </>
      ) : null}
      {!isRecyclingBU ? (
        <>
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
        </>
      ) : null}
      {values.workOrder &&
      (values.workOrder.ticketUrl || values.workOrder.mediaFiles?.length > 0) ? (
        <>
          <Divider />
          <Layouts.Grid columns={values.workOrder.ticketUrl ? '1fr 3fr' : '1fr'} columnGap="2">
            {values.workOrder.ticketUrl ? (
              <div>
                <Typography color="secondary" as="label" shade="desaturated">
                  {t(`${I18N_PATH}Ticket`)}
                </Typography>
                <Layouts.Margin as={Layouts.Box} top="1" width="36px" height="36px">
                  <FilePreviewWithModal
                    src={values.workOrder.ticketUrl}
                    fileName={t(`${I18N_PATH}TicketFromOrder`, { id: values.id })}
                    category={t(`${I18N_PATH}Ticket`)}
                    author={values.workOrder.ticketAuthor}
                    timestamp={values.workOrder.ticketDate ?? undefined}
                    size="small"
                  />
                </Layouts.Margin>
              </div>
            ) : null}
            {values.workOrder.mediaFiles?.length > 0 ? (
              <div>
                <Typography color="secondary" as="label" shade="desaturated">
                  {t(`${I18N_PATH}MediaFiles`)}
                </Typography>
                <FilePreviewGallery
                  data={values.workOrder.mediaFiles.map(mediaFile => ({
                    src: mediaFile.url,
                    author: mediaFile.author,
                    timestamp: mediaFile.timestamp,
                    fileName: mediaFile.fileName ?? 'unknown',
                    category: t(`${I18N_PATH}MediaFile`),
                    size: 'small',
                  }))}
                />
              </div>
            ) : null}
          </Layouts.Grid>
        </>
      ) : null}
      <Divider />
      {values.receipts?.length > 0 ? (
        <div>
          <Typography color="secondary" as="label" shade="desaturated">
            {t(`${I18N_PATH}Receipts`)}
          </Typography>
          <FilePreviewGallery
            data={values.receipts.map(receipt => ({
              src: receipt.receiptPreviewUrl,
              author: 'System',
              timestamp: values.createdAt as Date,
              fileName: 'Prepayment receipt.pdf',
              category: t(`${I18N_PATH}Receipt`),
              downloadSrc: receipt.receiptPdfUrl,
              size: 'small',
            }))}
          />
        </div>
      ) : null}
    </JobSiteSectionLayout>
  );
};

export default JobSiteSection;
