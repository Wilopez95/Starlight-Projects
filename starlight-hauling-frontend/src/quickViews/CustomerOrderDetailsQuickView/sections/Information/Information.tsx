/* eslint-disable new-cap */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';

import { Badge, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { IOrderInformation } from '@root/components/CustomerJobSiteOrderTable/types';
import { BusinessLineType } from '@root/consts';
import { getColorByStatus } from '@root/helpers';
import { useIsRecyclingFacilityBU } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { Order } from '@root/stores/entities';

const fallback = '-';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.Information.Text.';

const InformationSection: React.FC<IOrderInformation> = ({ recyclingWONumber }) => {
  const { values } = useFormikContext<Order>();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isRecyclingBU = useIsRecyclingFacilityBU();

  const badgeColor = getColorByStatus(values.status);
  const createdAtDate = formatDateTime(values.createdAt as Date).date;
  const createdAtTime = formatDateTime(values.createdAt as Date, { timeZone: localTimeZone }).time;

  const contactPhone = values.orderContact?.phoneNumbers?.find(
    phoneNumber => phoneNumber.type === 'main',
  );
  const permitRequired = values?.customerJobSite?.permitRequired ?? false;
  const poRequired = values?.customerJobSite?.permitRequired ?? true;

  const woNumber = useMemo(() => {
    if (
      !values.thirdPartyHauler?.description &&
      values.workOrder?.woNumber === -1 &&
      !recyclingWONumber
    ) {
      return t('Text.Pending');
    }

    return isRecyclingBU ? recyclingWONumber : values.workOrder?.woNumber;
  }, [
    isRecyclingBU,
    recyclingWONumber,
    t,
    values.thirdPartyHauler?.description,
    values.workOrder?.woNumber,
  ]);

  return (
    <Layouts.Grid gap="4" columns={2}>
      <Layouts.Cell width={2}>
        <Typography variant="bodyLarge" fontWeight="bold">
          {t(`${I18N_PATH}Information`)}
        </Typography>
      </Layouts.Cell>
      <Layouts.Grid columns="150px 1fr" gap="4" autoRows="max-content">
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Status`)}
        </Typography>
        <span>
          <Badge color={badgeColor}>{startCase(values.status)}</Badge>
        </span>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}OrderCreated`)}
        </Typography>
        <span>
          <Typography as="span">{createdAtTime}</Typography>
          <Typography as="span" color="secondary">
            ・{createdAtDate}
          </Typography>
        </span>
        {!isRecyclingBU ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}ServiceArea`)}
            </Typography>
            <span>{values.serviceArea?.name ?? fallback}</span>
          </>
        ) : null}
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}LineOfBusiness`)}
        </Typography>
        <span>{values.businessLine?.name}</span>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}WO`)}
        </Typography>
        <span>{woNumber}</span>
        {values.callOnWayPhoneNumber ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}CallOnWay`)}
            </Typography>
            <span>{values.callOnWayPhoneNumber}</span>
          </>
        ) : null}
        {values.textOnWayPhoneNumber ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}TextOnWay`)}
            </Typography>
            <span>{values.textOnWayPhoneNumber}</span>
          </>
        ) : null}
      </Layouts.Grid>
      <Layouts.Grid columns="150px 1fr" gap="4" autoRows="max-content">
        {values.businessLine.type === BusinessLineType.portableToilets ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}PreferredRoute`)}
            </Typography>
            <span>{values.workOrder?.route ?? fallback}</span>
          </>
        ) : null}
        {!isRecyclingBU ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}3rdPartyHauler`)}
            </Typography>
            <span>{values.thirdPartyHauler?.description ?? fallback}</span>
          </>
        ) : null}
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}OrderContact`)}
        </Typography>
        <span>
          {values.orderContact
            ? `${values.orderContact.firstName} ${values.orderContact.lastName}`
            : fallback}
        </span>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}PhoneNumber`)}
        </Typography>
        <span>{contactPhone?.number ?? fallback}</span>
        {!isRecyclingBU && permitRequired ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Permit`)}
            </Typography>
            <span>{values.permit?.number}</span>
          </>
        ) : null}
        {poRequired ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}PONumber`)}
            </Typography>
            <span>{values.purchaseOrder?.poNumber ?? fallback}</span>
          </>
        ) : null}
      </Layouts.Grid>
      <Layouts.Cell width={2}>
        <Divider bottom />
      </Layouts.Cell>
    </Layouts.Grid>
  );
};

export default InformationSection;
