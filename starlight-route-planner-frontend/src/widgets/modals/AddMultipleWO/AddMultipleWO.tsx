import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';
import { xor } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Divider, Table } from '@root/common/TableTools';
import { useDateTime, useStores } from '@root/hooks';

import { Modal, TableScrollContainer } from './styles';
import { TableBody } from './TableBody';
import { TableHeader } from './TableHeader';
import { IAddMultipleWO, IWorkOrdersDataTable } from './types';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'components.modals.AddMultipleWO.';

export const AddMultipleWO: React.FC<IAddMultipleWO> = observer(
  ({ onClose, onSubmit, multipleItems }) => {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const { t } = useTranslation();
    const { formatDateTime } = useDateTime();
    const { workOrderDailyRouteStore, materialStore, equipmentItemStore } = useStores();

    useEffect(() => {
      workOrderDailyRouteStore.checkWorkOrdersRouteStatus(multipleItems);
    }, [workOrderDailyRouteStore, multipleItems]);

    const checkedWorkOrdersRouteStatus = useMemo(() => {
      if (!workOrderDailyRouteStore.checkedWorkOrdersRouteStatus) {
        return [];
      }

      const { available, updating } = workOrderDailyRouteStore.checkedWorkOrdersRouteStatus;

      return available.concat(updating);
    }, [workOrderDailyRouteStore.checkedWorkOrdersRouteStatus]);

    const workOrdersTableData: IWorkOrdersDataTable[] = useMemo(() => {
      if (!checkedWorkOrdersRouteStatus.length) {
        return [];
      }

      return checkedWorkOrdersRouteStatus.map(id => {
        const workOrder = workOrderDailyRouteStore.getById(id);
        const material = materialStore.getById(workOrder?.materialId);
        const equipment = equipmentItemStore.getById(workOrder?.equipmentItemId);

        return {
          id,
          dailyRouteId: workOrder?.dailyRouteId,
          displayId: workOrder?.displayId ?? '-',
          serviceType: workOrder?.billableServiceDescription,
          materialType: material?.description,
          equipmentSize: equipment?.description,
          time: formatDateTime({
            from: workOrder?.bestTimeToComeFrom,
            to: workOrder?.bestTimeToComeTo,
          }),
        };
      });
    }, [
      formatDateTime,
      equipmentItemStore,
      workOrderDailyRouteStore,
      checkedWorkOrdersRouteStatus,
      materialStore,
    ]);

    const { available, updating } = useMemo(() => {
      return workOrdersTableData.reduce<{
        available: IWorkOrdersDataTable[];
        updating: IWorkOrdersDataTable[];
      }>(
        (acc, workOrder) => {
          if (
            workOrderDailyRouteStore.checkedWorkOrdersRouteStatus?.available.includes(workOrder.id)
          ) {
            acc.available.push(workOrder);
          }

          if (
            workOrderDailyRouteStore.checkedWorkOrdersRouteStatus?.updating.includes(workOrder.id)
          ) {
            acc.updating.push(workOrder);
          }

          return acc;
        },
        {
          available: [],
          updating: [],
        },
      );
    }, [workOrdersTableData, workOrderDailyRouteStore.checkedWorkOrdersRouteStatus]);

    const unassignedItemsIds = useMemo(() => {
      const unassignedItems = available.filter(({ dailyRouteId }) => {
        return !dailyRouteId;
      });

      return unassignedItems.map(({ id }) => id);
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
      const data = allSelected ? [] : available.map(({ id }) => id);

      setSelectedRows(data);
    }, [allSelected, available]);

    const toggleCheckbox = useCallback((id: number) => {
      setSelectedRows(ids => xor(ids, [id]));
    }, []);

    const handleSubmit = useCallback(async () => {
      const valid = await workOrderDailyRouteStore.checkWorkOrdersRouteStatus(selectedRows);

      if (valid) {
        onSubmit(selectedRows);
      }
    }, [workOrderDailyRouteStore, onSubmit, selectedRows]);

    return (
      <Modal isOpen onClose={onClose}>
        <Layouts.Padding top="3" bottom="2" left="3" right="3">
          <Layouts.Flex direction="column">
            <Typography color="default" as="label" shade="standard" variant="headerThree">
              {t(`${I18N_PATH}Title`)}
            </Typography>
            <Layouts.Margin top="2">
              <Typography color="secondary" as="label" shade="light" variant="bodyMedium">
                {t(`${I18N_PATH}SubTitle`)}
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
                workOrders={available}
              />
            )}
            {!!updating.length && (
              <TableBody
                title={t(`${I18N_ROOT_PATH}RoutesUpdatingStatus`)}
                toggleCheckbox={toggleCheckbox}
                selectedRows={selectedRows}
                workOrders={updating}
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
                {t(`${I18N_PATH}Continue`)}
              </Button>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Padding>
      </Modal>
    );
  },
);
