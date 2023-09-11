import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns-tz';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useIntl } from '@root/i18n/useIntl';
import { RecurrentOrder } from '@root/stores/entities';

const fallback = '-';

const I18N_PATH = 'pages.CustomerRecurrentOrders.tables.MainInformation.sections.Information.Text.';

const InformationSection: React.FC = () => {
  const { values } = useFormikContext<RecurrentOrder>();
  const { dateFormat, formatDateTime } = useIntl();
  const { t } = useTranslation();

  const createdAtDate = values.createdAt && format(values.createdAt, dateFormat.date);
  const createdAtTime = values.createdAt && format(values.createdAt, dateFormat.time);

  const contactPhone = values.orderContact?.phoneNumbers?.find(
    phoneNumber => phoneNumber.type === 'main',
  );

  return (
    <Layouts.Grid gap="4" columns={2}>
      <Layouts.Cell width={2}>
        <Typography variant="headerFour">{t(`${I18N_PATH}OrderDetails`)}</Typography>
        {values.lastFailureDate ? (
          <Layouts.Margin top="2">
            <Layouts.Padding
              as={Layouts.Box}
              top="1"
              bottom="1"
              backgroundColor="alert"
              backgroundShade="desaturated"
            >
              <Typography textAlign="center" color="alert">
                {t(`${I18N_PATH}FailedToGenerate`, {
                  date: formatDateTime(values.lastFailureDate).date,
                })}
              </Typography>
            </Layouts.Padding>
          </Layouts.Margin>
        ) : null}
      </Layouts.Cell>
      <Layouts.Grid columns="150px 1fr" gap="2">
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Created`)}
        </Typography>
        <span>
          <Typography as="span">{createdAtTime}</Typography>
          <Typography as="span" color="secondary">
            ・{createdAtDate}
          </Typography>
        </span>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}User`)}
        </Typography>
        <span>{values.customer?.name ?? fallback}</span>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}LineOfBusiness`)}
        </Typography>
        <span>{values.businessLine?.name}</span>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}ServiceArea`)}
        </Typography>
        <span>{values.serviceArea?.name ?? fallback}</span>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}3rdPartyHauler`)}
        </Typography>
        <span>{values.thirdPartyHauler?.description ?? fallback}</span>
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
      <Layouts.Grid columns="150px 1fr" gap="2">
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
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}StartDate`)}
        </Typography>
        {values.startDate ? <span>{formatDateTime(values.startDate).date}</span> : null}
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}NextServiceDate`)}
        </Typography>
        {values.nextServiceDate ? <span>{formatDateTime(values.nextServiceDate).date}</span> : null}
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}EndDate`)}
        </Typography>
        {<span>{values.endDate ? formatDateTime(values.endDate).date : fallback}</span>}
        {values.permit?.number ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Permit`)}
            </Typography>
            <span>{values.permit.number}</span>
          </>
        ) : null}
        {values.purchaseOrder ? (
          <>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18N_PATH}PONumber`)}
            </Typography>
            <span>{values.purchaseOrder.poNumber}</span>
          </>
        ) : null}
      </Layouts.Grid>
      <Layouts.Cell width={2}>
        <Divider bottom />
      </Layouts.Cell>
    </Layouts.Grid>
  );
};

export default observer(InformationSection);
