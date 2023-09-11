import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';
import { xor } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { MarkerAssetType } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { FREQUENCY } from '@root/consts';
import { getMarkerAssetType } from '@root/helpers/getMarkerAssetType';
import { useDateTime, useStores } from '@root/hooks';

import { TableBody } from './TableBody/TableBody';
import { TableHeader } from './TableHeader/TableHeader';
import { Modal, TableScrollContainer } from './styles';
import { IServiceItemsDataTable } from './types';

interface IProps {
  serviceItemsIds: number[];
  onClose(): void;
  onSubmit(data: number[]): void;
}

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'quickViews.AddMultipleServiceItems.Text.';

export const AddMultipleServiceItemsModal: React.FC<IProps> = observer(
  ({ serviceItemsIds, onClose, onSubmit }) => {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const { t } = useTranslation();
    const { formatDateTime } = useDateTime();
    const { haulingServiceItemStore, materialStore, equipmentItemStore } = useStores();

    useEffect(() => {
      haulingServiceItemStore.checkServiceItemsRouteStatus(serviceItemsIds);
    }, [haulingServiceItemStore, serviceItemsIds]);

    const checkedServiceItemsRouteStatus = useMemo(() => {
      if (!haulingServiceItemStore.checkedServiceItemsRouteStatus) {
        return [];
      }

      const { available, updating, published } =
        haulingServiceItemStore.checkedServiceItemsRouteStatus;

      return available.concat(updating, published);
    }, [haulingServiceItemStore.checkedServiceItemsRouteStatus]);

    const serviceItemsTableData: IServiceItemsDataTable[] = useMemo(() => {
      if (!checkedServiceItemsRouteStatus.length) {
        return [];
      }

      return checkedServiceItemsRouteStatus.map(id => {
        const serviceItem = haulingServiceItemStore.getById(id);
        const material = materialStore.getById(serviceItem?.materialId);
        const equipment = equipmentItemStore.getById(serviceItem?.equipmentItemId);

        return {
          id,
          serviceType: serviceItem?.billableServiceDescription,
          materialType: material?.description,
          equipmentSize: equipment?.description,
          serviceDaysOfWeek: serviceItem?.serviceDaysOfWeek,
          frequency:
            FREQUENCY.find(freq => freq.value === serviceItem?.serviceFrequencyId)?.label ??
            'Unhandled frequency',
          time: formatDateTime({
            from: serviceItem?.bestTimeToComeFrom,
            to: serviceItem?.bestTimeToComeTo,
          }),
        };
      });
    }, [
      checkedServiceItemsRouteStatus,
      haulingServiceItemStore,
      materialStore,
      equipmentItemStore,
      formatDateTime,
    ]);

    const { available, updating, published } = useMemo(() => {
      return serviceItemsTableData.reduce<{
        available: IServiceItemsDataTable[];
        updating: IServiceItemsDataTable[];
        published: IServiceItemsDataTable[];
      }>(
        (acc, serviceItem) => {
          if (
            haulingServiceItemStore.checkedServiceItemsRouteStatus?.available.includes(
              serviceItem.id,
            )
          ) {
            acc.available.push(serviceItem);
          }

          if (
            haulingServiceItemStore.checkedServiceItemsRouteStatus?.updating.includes(
              serviceItem.id,
            )
          ) {
            acc.updating.push(serviceItem);
          }

          if (
            haulingServiceItemStore.checkedServiceItemsRouteStatus?.published.includes(
              serviceItem.id,
            )
          ) {
            acc.published.push(serviceItem);
          }

          return acc;
        },
        {
          available: [],
          updating: [],
          published: [],
        },
      );
    }, [serviceItemsTableData, haulingServiceItemStore.checkedServiceItemsRouteStatus]);

    const allItemsToSelect = useMemo(() => {
      return available.map(({ id }) => id);
    }, [available]);

    const unassignedItemsIds = useMemo(() => {
      const unassignedItems = available.filter(({ id, serviceDaysOfWeek }) => {
        if (!id || !serviceDaysOfWeek) {
          return false;
        }

        const assetType = getMarkerAssetType(serviceDaysOfWeek);

        return assetType !== MarkerAssetType.assigned;
      });

      return unassignedItems.map(item => item.id);
    }, [available]);

    useEffect(() => {
      if (unassignedItemsIds.length) {
        setSelectedRows(unassignedItemsIds);
      }
    }, [unassignedItemsIds]);

    const allSelected = useMemo(
      () => selectedRows.length === available.length,
      [selectedRows.length, available.length],
    );

    const toggleAllSelected = useCallback(() => {
      const data = allSelected ? [] : allItemsToSelect;

      setSelectedRows(data);
    }, [allSelected, allItemsToSelect]);

    const toggleCheckbox = useCallback((id: number) => {
      setSelectedRows(ids => xor(ids, [id]));
    }, []);

    const handleSubmit = useCallback(async () => {
      const valid = await haulingServiceItemStore.checkServiceItemsRouteStatus(selectedRows);

      if (valid) {
        onSubmit(selectedRows);
      }
    }, [haulingServiceItemStore, onSubmit, selectedRows]);

    return (
      <Modal isOpen>
        <Layouts.Padding top="3" bottom="2" left="3" right="3">
          <Layouts.Flex direction="column">
            <Typography color="default" as="label" shade="standard" variant="headerThree">
              {t(`${I18N_PATH}Title`)}
            </Typography>
            <Layouts.Margin top="2">
              <Typography color="secondary" as="label" shade="light" variant="bodyMedium">
                {t(`${I18N_PATH}Subtitle`)}
              </Typography>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Padding>
        <TableScrollContainer>
          <Table>
            <TableHeader isSelected={allSelected} toggleAllCheck={toggleAllSelected} />
            {!!available.length && (
              <TableBody
                title={t(`${I18N_ROOT_PATH}Available`)}
                toggleCheckbox={toggleCheckbox}
                selectedRows={selectedRows}
                serviceItems={available}
              />
            )}
            {!!updating.length && (
              <TableBody
                title={t(`${I18N_ROOT_PATH}RoutesUpdatingStatus`)}
                toggleCheckbox={toggleCheckbox}
                selectedRows={selectedRows}
                serviceItems={updating}
                disabled
              />
            )}
            {!!published.length && (
              <TableBody
                title={t(`${I18N_ROOT_PATH}PublishedRoutes`)}
                toggleCheckbox={toggleCheckbox}
                selectedRows={selectedRows}
                serviceItems={published}
                disabled
              />
            )}
          </Table>
        </TableScrollContainer>
        <Divider />
        <Layouts.Padding top="2" bottom="2" left="3" right="3">
          <Layouts.Flex>
            <Button variant="white" onClick={onClose}>
              {t(`${I18N_PATH}Cancel`)}
            </Button>
            <Layouts.Margin left="auto">
              <Button variant="primary" onClick={handleSubmit} disabled={!selectedRows.length}>
                {t(`${I18N_PATH}Add`)}
              </Button>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Padding>
      </Modal>
    );
  },
);
