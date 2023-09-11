import React, { useCallback, useEffect, useMemo } from 'react';
import { Trans } from '../../../../i18n';
import { flatten, omit } from 'lodash/fp';
import { Button } from '@material-ui/core';
import { useField, useForm } from 'react-final-form';

import {
  HaulingBillableItemType,
  OrderBillableItem,
  OrderType,
  useCreateOrderBillableItemsMutation,
  useGetHaulingBillableItemsQuery,
  useCreateAutoOrderBillableItemsMutation,
  GetOrderQuery,
} from '../../../../graphql/api';
import { openModal } from '../../../../components/Modals';
import { OrderBillableItemsForm } from './OrderBillableItemsForm';
import { showError } from '@starlightpro/common';
import { isNumber, keyBy } from 'lodash-es';
import { calculateAutoBillableItems } from '../../helpers/calculateAutoBillableItems';

export const AddNewBillableItemButton = () => {
  const { input: billableItemsInput } = useField('billableItems', {
    subscription: { value: true },
  });
  const {
    input: { value: priceGroupId },
  } = useField('priceGroupId', { subscription: { value: true } });
  const {
    input: { value: material },
  } = useField('material', {
    subscription: { value: true },
  });
  const {
    input: { value: type },
  } = useField<OrderType>('type', {
    subscription: { value: true },
  });
  const {
    meta: { pristine: miscMaterialsPristine },
  } = useField('miscellaneousMaterialsDistribution', { subscription: { pristine: true } });
  const form = useForm();

  const { data: billableItems } = useGetHaulingBillableItemsQuery({
    variables: {
      search: {
        active: true,
        types: [HaulingBillableItemType.Line, HaulingBillableItemType.Miscellanies],
      },
    },
    fetchPolicy: 'no-cache',
  });

  const miscBillableItems = useMemo(
    () =>
      billableItems?.getHaulingBillableItems.filter(
        ({ type, materialIds, materialBasedPricing }) =>
          type === HaulingBillableItemType.Miscellanies &&
          materialIds?.length &&
          materialBasedPricing,
      ) || [],
    [billableItems?.getHaulingBillableItems],
  );

  const [createOrderBillableItems] = useCreateOrderBillableItemsMutation();
  const [createAutoOrderBillableItems] = useCreateAutoOrderBillableItemsMutation();

  useEffect(() => {
    if (miscBillableItems.length === 0 || miscMaterialsPristine || type !== OrderType.Dump) {
      return;
    }

    let unsubscribe: () => void | undefined;

    (async function () {
      const { values } = form.getState();
      const distributionMaterials = (values.miscellaneousMaterialsDistribution as GetOrderQuery['order']['miscellaneousMaterialsDistribution'])?.map(
        (distribution) => distribution.materialId,
      );

      if (!distributionMaterials || distributionMaterials.length === 0) {
        return;
      }

      const { data } = await createAutoOrderBillableItems({
        variables: {
          billableItemsIds: miscBillableItems
            .filter((misc) =>
              misc.materialIds?.some((materialId) => distributionMaterials.includes(materialId)),
            )
            .map(({ id }) => id),
          priceGroupId,
          materialId: material?.id || null,
          type,
          distributionMaterials,
        },
      });

      if (!data || !data.createAutoOrderBillableItems) {
        return;
      }

      unsubscribe = calculateAutoBillableItems(
        miscBillableItems,
        keyBy(
          data.createAutoOrderBillableItems,
          (obi) => `${obi.billableItemId}:${obi.materialId}`,
        ),
      )(form);
    })();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    createAutoOrderBillableItems,
    createOrderBillableItems,
    form,
    material?.id,
    miscBillableItems,
    miscMaterialsPristine,
    priceGroupId,
    type,
  ]);

  const onSubmit = useCallback(
    async (billableItemsIds: number[]) => {
      try {
        const { data } = await createOrderBillableItems({
          variables: {
            billableItemsIds,
            priceGroupId,
            materialId: material?.id || null,
            type,
          },
        });

        if (!data) {
          return;
        }

        const orderBillableItems = flatten<OrderBillableItem>([
          billableItemsInput.value,
          data.createOrderBillableItems,
        ]).map(omit(['__typename']));

        billableItemsInput.onChange({
          target: {
            name: 'billableItems',
            value: orderBillableItems,
          },
        });
      } catch (e) {
        showError(e.message);
      }
    },
    [createOrderBillableItems, priceGroupId, material?.id, type, billableItemsInput],
  );

  const onClick = () =>
    openModal({
      content: (
        <OrderBillableItemsForm
          onSubmit={onSubmit}
          billableItems={billableItems?.getHaulingBillableItems}
          billableItemsInput={billableItemsInput}
        />
      ),
    });

  return (
    <Button disabled={!isNumber(priceGroupId)} onClick={onClick} variant="outlined" color="primary">
      <Trans>Add Billable Item</Trans>
    </Button>
  );
};
