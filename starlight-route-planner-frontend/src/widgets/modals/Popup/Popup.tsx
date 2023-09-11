import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InNewWindowIcon, Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { EmptyValuePlaceholder } from '@root/common';
import { DaysStatusPreview } from '@root/common/DaysStatusPreview';
import { FREQUENCY, Paths } from '@root/consts';
import { formatAddress, getHaulingRedirectUrl, pathToUrl } from '@root/helpers';
import { useBusinessContext, useDateTime, useOpenMasterRouteDetails, useStores } from '@root/hooks';

import * as Styles from './styles';
import { IPopup } from './types';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'components.modals.Popup.';

export const Popup: React.FC<IPopup> = observer(
  ({ serviceItemId, masterRouteId, onClosePopup }) => {
    const { t } = useTranslation();
    const {
      masterRoutesStore,
      haulingServiceItemStore,
      businessLineStore,
      customerStore,
      materialStore,
      equipmentItemStore,
    } = useStores();
    const { formatDateTime } = useDateTime();
    const { businessUnitId } = useBusinessContext();
    const handleAssignedDayClick = useOpenMasterRouteDetails();

    let serviceItem = haulingServiceItemStore.getById(serviceItemId);

    // We use this when filter lob type not match master route lob type
    // So we get service item (only one that match) from current master route
    if (serviceItem === null) {
      const masterRoute = masterRoutesStore.getById(masterRouteId);

      serviceItem = masterRoute?.serviceItems.find(({ id }) => serviceItemId === id) ?? null;
    }

    const {
      bestTimeToComeFrom,
      bestTimeToComeTo,
      startDate,
      endDate,
      customerId,
      subscriptionId,
      jobSite,
      billableServiceDescription,
      equipmentItemId,
      businessLineId,
      materialId,
      serviceFrequencyId,
      serviceDaysOfWeek = [],
    } = serviceItem ?? {};

    useEffect(() => {
      if (!customerId) {
        return;
      }

      customerStore.requestById(customerId);
    }, [customerId, customerStore]);

    useEffect(() => {
      const loadMaterial = async () => {
        const materialLocal = materialStore.getById(materialId);

        if (materialLocal) {
          materialStore.setCurrentMaterial(materialLocal);
        } else if (materialId) {
          await materialStore.fetchById(materialId);
        }
      };

      const loadEquipment = async () => {
        const equipmentLocal = equipmentItemStore.getById(equipmentItemId);

        if (equipmentLocal) {
          equipmentItemStore.setCurrentEquipment(equipmentLocal);
        } else if (businessLineId && equipmentItemId) {
          await equipmentItemStore.fetchById(businessLineId, equipmentItemId);
        }
      };

      Promise.all([loadMaterial(), loadEquipment()]);
    }, [materialStore, equipmentItemStore, materialId, businessLineId, equipmentItemId]);

    const businessLine = businessLineStore.getById(businessLineId);
    const frequency = FREQUENCY.find(freq => freq.value === serviceFrequencyId);

    const generateRedirectLink = useMemo(() => {
      if (!subscriptionId || !customerId) {
        return undefined;
      }

      const getRedirectUrl = getHaulingRedirectUrl(window.location.hostname);

      const url = getRedirectUrl(
        pathToUrl(Paths.CustomerSubscriptionModule.Details, {
          businessUnit: businessUnitId,
          customerId,
          tab: 'active',
          id: subscriptionId,
        }),
      );

      return url;
    }, [businessUnitId, customerId, subscriptionId]);

    const renderPeriod = useMemo(() => {
      if (!endDate) {
        const date = formatDateTime({
          from: startDate ? new Date(startDate) : undefined,
          format: 'dateDefault',
          defaultValue: '-',
        });

        return `From ${date}`;
      }

      const _startDate = formatDateTime({
        from: startDate ? new Date(startDate) : undefined,
        format: 'dateDefault',
        defaultValue: '-',
      });
      const _endDate = formatDateTime({ from: new Date(endDate), format: 'dateDefault' });

      return `${_startDate} to ${_endDate}`;
    }, [startDate, endDate, formatDateTime]);

    const customerName = useMemo(() => {
      if (!customerStore.currentCustomer) {
        return '';
      }

      const { name, firstName = '', lastName = '' } = customerStore.currentCustomer;

      return name || `${firstName} ${lastName}`;
    }, [customerStore.currentCustomer]);

    return (
      <Styles.Box position="relative" backgroundColor="white">
        <Layouts.Padding padding="3">
          <Typography variant="headerFour" color="default" shade="dark">
            {t(`${I18N_PATH}Title`, { id: subscriptionId })}
          </Typography>
          <Styles.CrossIcon onClick={onClosePopup} role="button" aria-label="close" />
          <Layouts.Margin top="1" />
          <Layouts.Grid columns="160px auto" rowGap="0.5">
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Period`)}
            </Typography>
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {renderPeriod}
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
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_ROOT_PATH}Subscription#`)}
            </Typography>
            {subscriptionId ? (
              <Layouts.Flex>
                <Styles.Link href={generateRedirectLink} target="_blank">
                  {subscriptionId}
                </Styles.Link>
                <Layouts.Margin right="0.5" />
                <InNewWindowIcon />
              </Layouts.Flex>
            ) : (
              <EmptyValuePlaceholder />
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
            {materialStore.currentMaterialItem ? (
              <Typography variant="bodyMedium" color="secondary" shade="dark">
                {materialStore.currentMaterialItem.description}
              </Typography>
            ) : (
              <EmptyValuePlaceholder />
            )}
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}EquipmentSize`)}
            </Typography>
            {equipmentItemStore.currentEquipmentItem ? (
              <Typography variant="bodyMedium" color="secondary" shade="dark">
                {equipmentItemStore.currentEquipmentItem.description}
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
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              <DaysStatusPreview
                isLinked
                serviceDaysOfWeek={serviceDaysOfWeek}
                onClick={handleAssignedDayClick}
              />
            </Typography>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_ROOT_PATH}BestTimeToCome`)}
            </Typography>
            <Typography variant="bodyMedium" color="secondary" shade="dark">
              {formatDateTime({
                from: bestTimeToComeFrom,
                to: bestTimeToComeTo,
              })}
            </Typography>
          </Layouts.Grid>
        </Layouts.Padding>
      </Styles.Box>
    );
  },
);
