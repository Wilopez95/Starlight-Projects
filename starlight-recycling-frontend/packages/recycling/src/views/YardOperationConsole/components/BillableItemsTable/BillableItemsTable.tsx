import React, { useCallback, useEffect, useMemo } from 'react';
import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import cs from 'classnames';
import { useField } from 'react-final-form';

import {
  MinimalWeightQuery,
  OrderBillableItem,
  OrderBillableItemType,
  OrderPriceSourceType,
  OrderStatus,
  OrderType,
  useFillOrderBillableItemsWithPricesMutation,
  useMinimalWeightQuery,
  useOrderBillableItemsLazyQuery,
  useGetHaulingMaterialsQuery,
  FillOrderBillableItemsWithPricesMutationResult,
} from '../../../../graphql/api';
import { BillableItemRow } from './BillableItemRow';
import { ReadOnlyOrderFormComponent } from '../../types';
import { MaterialBillableItemRow } from './MaterialBillableItemRow';
import { Trans } from '../../../../i18n';
import FeeBillableItemRow from './FeeBillableItemRow';
import { showError } from '@starlightpro/common';
import { isNil, omit } from 'lodash-es';
import {
  isFeeOrderBillableItem,
  isMaterialOrderBillableItem,
  isOrderBillableItemMaterialOrFee,
} from '../../helpers/formatBillableItems';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../../hooks/useCompanyMeasurementUnits';
import { orderStatuses } from '../../../OrdersView/constant';
import { UnitOfMeasurementType } from '../../../../constants/unitOfMeasurement';
import { convertKgToUom } from '../../../../hooks/useUnitOfMeasurementConversion';

const sortOrderMap = {
  [OrderBillableItemType.Material]: 1,
  [OrderBillableItemType.Line]: 2,
  [OrderBillableItemType.Miscellanies]: 3,
  [OrderBillableItemType.Fee]: 4,
};

const useStyles = makeStyles(
  ({ spacing }) => ({
    tableHeadRow: {
      boxShadow: 'none',
    },
    tableHeadCell: {
      whiteSpace: 'nowrap',
    },
    tableContainer: {
      marginTop: spacing(2),
    },
    tableRow: {
      '& > *:first-child': {
        paddingLeft: 0,
      },
      '& > *:last-child': {
        paddingRight: 0,
      },
    },
    skeleton: {
      display: 'inline-block',
      width: 36,
    },
  }),
  { name: 'BillableItemsTable' },
);

interface Props extends ReadOnlyOrderFormComponent {}

export const BillableItemsTable: React.FC<Props> = ({ readOnly }) => {
  const classes = useStyles();
  const haulingMaterials = useGetHaulingMaterialsQuery();
  const { convertWeights } = useCompanyMeasurementUnits();
  const {
    input: { value: billableItems, onChange: onChangeBillableItems },
  } = useField<OrderBillableItem[]>('billableItems', { subscription: { value: true } });
  const {
    input: { value: orderMaterial },
  } = useField('material', {
    subscription: { value: true },
  });
  const {
    input: { value: priceGroupId },
  } = useField('priceGroupId', {
    subscription: { value: true },
  });
  const {
    input: { value: type },
  } = useField<OrderType>('type', {
    subscription: { value: true },
  });
  const {
    input: { value: id },
  } = useField<number>('id', {
    subscription: { value: true },
  });

  const {
    input: { value: status },
  } = useField<OrderStatus>('status', {
    subscription: { value: true },
  });
  const {
    input: { value: minimalWeight, onChange: onChangeMinimalWeight },
  } = useField('minimalWeight', {
    subscription: { value: true },
  });

  const [
    getOrderBillableItemsLazy,
    { called: calledBillableItems },
  ] = useOrderBillableItemsLazyQuery({
    onCompleted: (fetchedOrderBillableItems) => {
      const materials = haulingMaterials?.data?.haulingMaterials?.data || [];

      const getMaterialUom = (id: number): UnitOfMeasurementType =>
        materials.find((material) => material.id === id)?.units as UnitOfMeasurementType;

      if (fetchedOrderBillableItems?.order.billableItems) {
        onChangeBillableItems({
          target: {
            name: 'billableItems',
            value: fetchedOrderBillableItems.order.billableItems.map((bi) => ({
              ...bi,
              quantity:
                isMaterialOrderBillableItem(bi) && bi.materialId
                  ? convertKgToUom(bi.quantity, getMaterialUom(bi.materialId))
                  : bi.quantity,
            })),
          },
        });
      }
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!calledBillableItems && type !== OrderType.NonService && id) {
      getOrderBillableItemsLazy({
        variables: {
          id: id,
        },
      });
    }
  }, [calledBillableItems, id, getOrderBillableItemsLazy, status, type]);

  const minimalWeightFetchComplete = useCallback<(data: MinimalWeightQuery) => void>(
    (data) => {
      if (data.minimalWeight && minimalWeight !== data.minimalWeight) {
        onChangeMinimalWeight({
          target: {
            name: 'minimalWeight',
            value: data.minimalWeight,
          },
        });
      }
    },
    [minimalWeight, onChangeMinimalWeight],
  );

  useMinimalWeightQuery({
    variables: {
      priceGroupId,
      materialId: orderMaterial.id,
      type,
    },
    skip: isNil(priceGroupId) || !orderMaterial || isNil(type),
    onCompleted: minimalWeightFetchComplete,
    fetchPolicy: 'network-only',
  });

  const onFillCompleted = useCallback(
    (values: FillOrderBillableItemsWithPricesMutationResult['data']) => {
      if (!onChangeBillableItems || !values) {
        return;
      }
      const feeBillableItem = values.fillOrderBillableItemsWithPrices?.find(isFeeOrderBillableItem);
      const thresholdBillableItem = values.fillOrderBillableItemsWithPrices?.find(
        isMaterialOrderBillableItem,
      );

      if (thresholdBillableItem) {
        if (thresholdBillableItem.quantityConverted) {
          thresholdBillableItem.quantity = thresholdBillableItem.quantityConverted;
        } else {
          const materials = haulingMaterials?.data?.haulingMaterials?.data || [];
          const unitOfMeasurement = materials.find(
            (material) => thresholdBillableItem.material?.id === material.id,
          )?.units as UnitOfMeasurementType;
          thresholdBillableItem.quantity = convertKgToUom(
            thresholdBillableItem.quantity,
            unitOfMeasurement,
          );
        }
      }

      onChangeBillableItems({
        target: {
          name: 'billableItems',
          value: billableItems.map((bi) => {
            switch (bi.type) {
              case OrderBillableItemType.Fee:
                return feeBillableItem;
              case OrderBillableItemType.Material:
                return thresholdBillableItem;
              default:
                return bi;
            }
          }),
        },
      });
    },
    [onChangeBillableItems, billableItems, haulingMaterials],
  );

  const [fillOrderWithPrices, { loading, called }] = useFillOrderBillableItemsWithPricesMutation({
    onCompleted: onFillCompleted,
    onError: (e) => showError(e.message),
  });

  useEffect(() => {
    const materialOrderBillableItem = billableItems.find(isMaterialOrderBillableItem);

    if (
      (!loading &&
        !called &&
        calledBillableItems &&
        billableItems.length &&
        !orderStatuses.includes(status)) ||
      (orderMaterial &&
        materialOrderBillableItem &&
        materialOrderBillableItem.material?.id !== orderMaterial.id)
    ) {
      const orderBillableItemsInput = billableItems
        .filter(isOrderBillableItemMaterialOrFee)
        .map((bi) => {
          let quantityConverted = bi.quantity;

          if (isMaterialOrderBillableItem(bi) && bi.material) {
            quantityConverted = convertWeights(
              bi.quantityConverted || bi.quantity,
              MeasureTarget.backend,
              bi.material.units || undefined,
            );
          }

          return {
            ...omit(bi, ['billableItem', 'material', 'thresholdId', '__typename']),
            materialId: orderMaterial.id,
            quantity: quantityConverted,
          };
        });

      fillOrderWithPrices({
        variables: {
          materialId: orderMaterial.id || null,
          priceGroupId,
          orderBillableItemsInput,
          type,
        },
      });
    }
  }, [
    orderMaterial,
    priceGroupId,
    fillOrderWithPrices,
    type,
    called,
    status,
    convertWeights,
    billableItems,
    calledBillableItems,
    loading,
  ]);

  const billableItemsRows = useMemo(() => {
    return !loading ? (
      billableItems
        .sort((x, y) => sortOrderMap[x.type] - sortOrderMap[y.type])
        .filter(
          (bi) =>
            !isFeeOrderBillableItem(bi) ||
            bi.price > 0 ||
            bi.priceSourceType === OrderPriceSourceType.Manual,
        )
        .map((billableItem, index) => {
          const itemName = `billableItems[${index}]`;

          if (isMaterialOrderBillableItem(billableItem)) {
            return (
              <MaterialBillableItemRow
                key={itemName}
                name={itemName}
                readOnly={readOnly}
                className={classes.tableRow}
                loading={loading}
                classes={{ skeleton: classes.skeleton }}
                useOrderBillableItem={billableItem}
              />
            );
          }

          if (isFeeOrderBillableItem(billableItem)) {
            return (
              <FeeBillableItemRow
                key={itemName}
                name={itemName}
                className={classes.tableRow}
                loading={loading}
                classes={{ skeleton: classes.skeleton }}
              />
            );
          }

          return (
            <BillableItemRow
              key={itemName}
              name={itemName}
              readOnly={readOnly}
              className={classes.tableRow}
              classes={{ skeleton: classes.skeleton }}
            />
          );
        })
    ) : (
      <Skeleton itemType="fitContent" width="200px" height={50} />
    );
  }, [billableItems, classes.skeleton, classes.tableRow, loading, readOnly]);

  return (
    <TableContainer className={classes.tableContainer}>
      <Table size="small">
        <TableHead>
          <TableRow className={cs(classes.tableHeadRow, classes.tableRow)}>
            <TableCell align="left" className={classes.tableHeadCell}>
              <Trans>Item</Trans>
            </TableCell>
            <TableCell align="left" className={classes.tableHeadCell}>
              <Trans>Material</Trans>
            </TableCell>
            <TableCell align="left" className={classes.tableHeadCell}>
              <Trans>Units</Trans>
            </TableCell>
            <TableCell align="right" className={classes.tableHeadCell}>
              <Trans>Price, $t(currency)</Trans>
            </TableCell>
            <TableCell align="right" className={classes.tableHeadCell}>
              <Trans>QTY</Trans>
            </TableCell>
            <TableCell align="right" className={classes.tableHeadCell}>
              <Trans>Total, $t(currency)</Trans>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{billableItemsRows}</TableBody>
      </Table>
    </TableContainer>
  );
};
