import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InNewWindowIcon, Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { EmptyValuePlaceholder } from '@root/common';
import { formatAddress, getHaulingRedirectUrl, getParentOrderPath } from '@root/helpers';
import { useBusinessContext, useDateTime, useStores } from '@root/hooks';

import { Link } from './styles';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'components.modals.WorkOrderDetails.';

interface IItem {
  pinItemId: number;
  single?: boolean;
}

export const Item: React.FC<IItem> = observer(({ pinItemId, single = true }) => {
  const {
    workOrderDailyRouteStore,
    businessLineStore,
    customerStore,
    materialStore,
    equipmentItemStore,
  } = useStores();
  const { t } = useTranslation();
  const { formatDateTime } = useDateTime();
  const { businessUnitId } = useBusinessContext();
  const getRedirectUrl = useMemo(() => getHaulingRedirectUrl(window.location.hostname), []);

  const workOrder = workOrderDailyRouteStore.getById(pinItemId);

  const {
    bestTimeToComeFrom,
    bestTimeToComeTo,
    serviceDate,
    customerId,
    jobSite,
    billableServiceDescription,
    equipmentItemId,
    businessLineId,
    materialId,
    orderDisplayId,
    dailyRouteId,
  } = workOrder ?? {};

  useEffect(() => {
    if (!customerId) {
      return;
    }

    customerStore.requestById(customerId);
  }, [customerId, customerStore]);

  const businessLine = businessLineStore.getById(businessLineId);
  const material = materialStore.getById(materialId);
  const equipment = equipmentItemStore.getById(equipmentItemId);

  const generateRedirectLink = useMemo(() => {
    if (!workOrder) {
      return undefined;
    }

    const parentOrderPath = getParentOrderPath(workOrder, businessUnitId);

    return parentOrderPath ? getRedirectUrl(parentOrderPath) : undefined;
  }, [workOrder, businessUnitId, getRedirectUrl]);

  const customerName = useMemo(() => {
    if (!customerStore.currentCustomer) {
      return '';
    }

    const { name, firstName = '', lastName = '' } = customerStore.currentCustomer;

    return name || `${firstName} ${lastName}`;
  }, [customerStore.currentCustomer]);

  return (
    <Layouts.Padding left="3" right="3" bottom="3">
      <Layouts.Grid columns="160px auto" rowGap="0.5">
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Date`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {serviceDate}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Customer`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {customerName}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}JobSite`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {formatAddress(jobSite?.address)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}LineOfBusiness`)}
        </Typography>
        {businessLine?.name ? (
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {businessLine.name}
          </Typography>
        ) : (
          <EmptyValuePlaceholder />
        )}
        {single && (
          <>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}ParentOrder`)}
            </Typography>
            <Layouts.Flex>
              <Link href={generateRedirectLink} target="_blank">
                {orderDisplayId}
              </Link>
              <Layouts.Margin right="0.5" />
              <InNewWindowIcon />
            </Layouts.Flex>
          </>
        )}
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_ROOT_PATH}Service`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {billableServiceDescription}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_ROOT_PATH}Material`)}
        </Typography>
        {material?.description ? (
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {material.description}
          </Typography>
        ) : (
          <EmptyValuePlaceholder />
        )}
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH}EquipmentSize`)}
        </Typography>
        {equipment?.description ? (
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {equipment.description}
          </Typography>
        ) : (
          <EmptyValuePlaceholder />
        )}
        {single ? (
          <>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}DailyRoute`)}
            </Typography>
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {dailyRouteId ?? t(`${I18N_PATH}DefaultDailyRoute`)}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}ParentOrder`)}
            </Typography>
            <Layouts.Flex>
              <Link href={generateRedirectLink} target="_blank">
                {orderDisplayId}
              </Link>
              <Layouts.Margin right="0.5" />
              <InNewWindowIcon />
            </Layouts.Flex>
          </>
        )}
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_ROOT_PATH}BestTimeToCome`)}
        </Typography>
        <Typography variant="bodyMedium" color="secondary" shade="dark">
          {formatDateTime({ from: bestTimeToComeFrom, to: bestTimeToComeTo })}
        </Typography>
      </Layouts.Grid>
    </Layouts.Padding>
  );
});
