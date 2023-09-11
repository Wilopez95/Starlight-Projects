import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { EmptyValuePlaceholder } from '@root/common';
import { DaysStatusPreview } from '@root/common/DaysStatusPreview';
import { FREQUENCY } from '@root/consts';
import { useDateTime, useOpenMasterRouteDetails, useStores } from '@root/hooks';
import { IHaulingServiceItem } from '@root/types';

import * as Styles from '../../styles';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'components.modals.Popup.';

interface IProps {
  serviceItem: IHaulingServiceItem;
}

const ServiceItemInfoSection: React.FC<IProps> = ({ serviceItem }) => {
  const { t } = useTranslation();
  const { materialStore, equipmentItemStore } = useStores();
  const { formatDateTime } = useDateTime();
  const handleAssignedDayClick = useOpenMasterRouteDetails();

  const {
    bestTimeToComeFrom,
    bestTimeToComeTo,
    billableServiceDescription,
    equipmentItemId,
    materialId,
    serviceFrequencyId,
    serviceDaysOfWeek = [],
  } = serviceItem;

  const material = materialStore.getById(materialId);
  const equipment = equipmentItemStore.getById(equipmentItemId);
  const frequency = FREQUENCY.find(freq => freq.value === serviceFrequencyId);

  return (
    <Styles.ServiceItemInfoWrapper>
      <Layouts.Padding top="3">
        <Layouts.Grid columns="160px auto" rowGap="0.5">
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
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}ServiceFrequency`)}
          </Typography>
          {frequency?.label ? (
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {frequency.label}
            </Typography>
          ) : (
            <EmptyValuePlaceholder />
          )}
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}AssignedDays`)}
          </Typography>
          <DaysStatusPreview
            isLinked
            serviceDaysOfWeek={serviceDaysOfWeek}
            onClick={handleAssignedDayClick}
          />
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_ROOT_PATH}BestTimeToCome`)}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {formatDateTime({ from: bestTimeToComeFrom, to: bestTimeToComeTo })}
          </Typography>
        </Layouts.Grid>
      </Layouts.Padding>
    </Styles.ServiceItemInfoWrapper>
  );
};

export default observer(ServiceItemInfoSection);
