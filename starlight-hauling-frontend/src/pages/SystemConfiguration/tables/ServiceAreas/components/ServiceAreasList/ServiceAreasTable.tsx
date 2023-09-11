import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { BBox } from '@turf/helpers';
import { observer } from 'mobx-react-lite';

import { DeleteIcon, EditIcon, PlusIcon } from '@root/assets';
import { InteractiveMap, Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { Routes } from '@root/consts';
import { handleEnterOrSpaceKeyDown, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  useBusinessContext,
  useCleanup,
  useCrudPermissions,
  useStores,
  useToggle,
} from '@root/hooks';
import { ServiceArea } from '@root/stores/entities';

import { PageHeader } from '../../../../components';
import { ISystemConfigurationTable } from '../../../../types';
import { RemoveServiceAreaModal } from '../modals';
import ServiceAreasEditor from '../ServiceAreasInteractive/ServiceAreasEditor/ServiceAreasEditor';

import configurationStyle from '../../../../css/styles.scss';
import styles from './css/styles.scss';

const ServiceAreasTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const drawRef = useRef();
  const tbodyContainerRef = useRef(null);
  const [fitBBox, setFitBBox] = useState<BBox | undefined>();
  const { t } = useTranslation();

  const history = useHistory();
  const { serviceAreaStore } = useStores();
  const { businessLineId, businessUnitId } = useBusinessContext();
  const [canViewServiceAreas, canUpdateServiceAreas, canCreateServiceAreas] = useCrudPermissions(
    'configuration',
    'service-areas',
  );

  useCleanup(serviceAreaStore);

  useEffect(() => {
    if (!businessUnitId || !businessLineId) {
      return;
    }

    if (canViewServiceAreas) {
      serviceAreaStore.cleanup();
      serviceAreaStore.request({
        businessUnitId,
        businessLineId,
      });
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canViewServiceAreas, serviceAreaStore, businessUnitId, businessLineId]);

  const serviceAreas = useMemo(
    () =>
      serviceAreaStore.sortedValues.filter(
        item => item.businessLineId?.toString() === businessLineId,
      ),
    [serviceAreaStore.sortedValues, businessLineId],
  );

  useEffect(() => {
    if (!serviceAreaStore.selectedEntity && serviceAreaStore.sortedValues) {
      serviceAreaStore.selectEntity(serviceAreas[0]);
    }
  });

  const extraneousServiceAreas = useMemo(
    () =>
      serviceAreaStore.sortedValues.filter(
        serviceArea =>
          serviceAreaStore.selectedEntity?.id &&
          serviceArea.id !== serviceAreaStore.selectedEntity.id &&
          serviceArea.active,
      ),
    [serviceAreaStore.sortedValues, serviceAreaStore.selectedEntity],
  );

  const navigateToCreateOrEditArea = useCallback(
    (id?: number) => {
      if (!businessUnitId || !businessLineId) {
        return;
      }
      serviceAreaStore.unSelectEntity();

      const serviceAreasBaseUrl = `/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Configuration}/${businessLineId}/${Routes.ServiceAreas}`;

      history.push(id ? `${serviceAreasBaseUrl}/${id}` : `${serviceAreasBaseUrl}/${Routes.Create}`);
    },
    [history, businessUnitId, businessLineId, serviceAreaStore],
  );

  const [isModalOpen, toggleModalOpen] = useToggle();

  const selectedArea = serviceAreaStore.selectedEntity;

  const removeServiceArea = useCallback(() => {
    if (!selectedArea) {
      return;
    }

    const selectedAreaId = selectedArea.id;

    toggleModalOpen();
    serviceAreaStore.delete(selectedAreaId);
    serviceAreas && serviceAreaStore.selectEntity(serviceAreas[0]);
  }, [serviceAreaStore, serviceAreas, selectedArea, toggleModalOpen]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLOrSVGElement>,
    callback: (i?: number) => void,
    index?: number,
  ) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      if (index) {
        callback(index);
      }
      callback();
    }
  };

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.ServiceAreas')} />
      <PageHeader title="Service Areas">
        {canCreateServiceAreas ? (
          <Button
            variant="primary"
            iconLeft={PlusIcon}
            onClick={() => navigateToCreateOrEditArea()}
          >
            Add New Service Area
          </Button>
        ) : null}
      </PageHeader>
      <TableTools.ScrollContainer scrollClassName={styles.tableContainerWrapper}>
        <Table className={styles.tableWrapper}>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>Status</TableTools.HeaderCell>
            <TableTools.HeaderCell>Name</TableTools.HeaderCell>
            <TableTools.HeaderCell>Description</TableTools.HeaderCell>
            <TableTools.HeaderCell />
          </TableTools.Header>
          <TableBody cells={4} ref={tbodyContainerRef} loading={false}>
            {serviceAreas.map((item: ServiceArea) => (
              <TableRow
                key={item.id}
                className={
                  item.id === serviceAreaStore.selectedEntity?.id ? styles.customRow : undefined
                }
                onClick={() => serviceAreaStore.selectEntity(item)}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellDescription}>
                  <Layouts.Box maxWidth="120px">
                    <Typography ellipsis>{item.name}</Typography>
                  </Layouts.Box>
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellDescription}>
                  <Layouts.Box maxWidth="120px">
                    <Typography ellipsis>{item.description}</Typography>
                  </Layouts.Box>
                </TableCell>
                <TableCell right>
                  {canUpdateServiceAreas ? (
                    <>
                      <EditIcon
                        role="button"
                        aria-label={t('Text.Edit')}
                        tabIndex={0}
                        className={styles.icon}
                        onClick={() => navigateToCreateOrEditArea(item.id)}
                        onKeyDown={e => handleKeyDown(e, navigateToCreateOrEditArea, item.id)}
                      />
                      <Layouts.Margin left="2">
                        <DeleteIcon
                          role="button"
                          aria-label={t('Text.Remove')}
                          tabIndex={0}
                          className={styles.icon}
                          onClick={toggleModalOpen}
                          onKeyDown={e => handleKeyDown(e, toggleModalOpen)}
                        />
                      </Layouts.Margin>
                    </>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className={styles.mapContainerWrapper}>
          <InteractiveMap initialFit={fitBBox} position="relative" height="100%" width="100%">
            <ServiceAreasEditor
              minimalReadonly
              extraneousServiceAreas={extraneousServiceAreas}
              currentServiceArea={serviceAreaStore.selectedEntity}
              drawRef={drawRef}
              setBBox={setFitBBox}
            />
          </InteractiveMap>
        </div>

        <RemoveServiceAreaModal
          isOpen={isModalOpen}
          onClose={toggleModalOpen}
          onRemove={removeServiceArea}
        />
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(ServiceAreasTable);
