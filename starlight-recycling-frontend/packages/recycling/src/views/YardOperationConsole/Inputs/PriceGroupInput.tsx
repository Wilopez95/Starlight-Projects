import React, { useCallback, useMemo } from 'react';
import gql from 'graphql-tag';
import { Trans, useTranslation } from '../../../i18n';
import { useField } from 'react-final-form';
import { SelectOption, showError, TextField } from '@starlightpro/common';
import { ReadOnlyOrderFormComponent } from '../types';
import {
  GetOrderQuery,
  HaulingPriceGroupsResultLevel,
  OrderType,
  useFillOrderBillableItemsWithPricesMutation,
  useGetHaulingMaterialsQuery,
  useGetHaulingPriceGroupsForOrderQuery,
} from '../../../graphql/api';
import { LoadingInput } from '../../../components/LoadingInput';
import { omit } from 'lodash/fp';
import { isObject } from 'lodash-es';
import { isMaterialOrderBillableItem } from '../helpers/formatBillableItems';
import { convertKgToUom } from '../../../hooks/useUnitOfMeasurementConversion';
import { UnitOfMeasurementType } from '../../../constants/unitOfMeasurement';

interface Props extends ReadOnlyOrderFormComponent {}

gql`
  query getHaulingPriceGroupsForOrder($filter: HaulingPriceGroupFilterInput!) {
    haulingPriceGroups(filter: $filter) {
      level
      customRatesGroups {
        id
        description
      }
      selectedId
    }
  }
`;

export const PriceGroupInput: React.FC<Props> = ({ readOnly }) => {
  const {
    input: { value: customer },
  } = useField<GetOrderQuery['order']['customer']>('customer', {
    subscription: { value: true },
  });
  const {
    input: { value: customerJobSite },
  } = useField<GetOrderQuery['order']['customerJobSite']>('customerJobSite', {
    subscription: { value: true },
  });
  const {
    input: { value: material },
  } = useField('material', {
    subscription: { value: true },
  });
  const {
    input: { value: billableItems, onChange: onChangeBillableItems },
  } = useField<GetOrderQuery['order']['billableItems']>('billableItems', {
    subscription: { value: true },
  });
  const {
    input: { value: type },
  } = useField<OrderType>('type', {
    subscription: { value: true },
  });

  const haulingMaterials = useGetHaulingMaterialsQuery();
  const [fillPrices] = useFillOrderBillableItemsWithPricesMutation();
  const [t] = useTranslation();
  const {
    data: priceGroupsData,
    loading: loadingPriceGroups,
  } = useGetHaulingPriceGroupsForOrderQuery({
    variables: {
      filter: {
        customerId: customer.id,
        customerJobSiteId: customerJobSite?.id,
      },
    },
    skip: !isObject(customer),
  });

  const handlePriceGroupChange = useCallback(
    async (e) => {
      if (billableItems.length === 0) {
        return;
      }

      const priceGroupId = parseInt(e.target.value);

      try {
        const result = await fillPrices({
          variables: {
            orderBillableItemsInput: billableItems.map(
              omit(['billableItem', 'material', 'thresholdId', '__typename']),
            ),
            priceGroupId,
            materialId: material?.id || null,
            type,
          },
        });

        if (result.data) {
          const { fillOrderBillableItemsWithPrices } = result.data;
          const materials = haulingMaterials?.data?.haulingMaterials?.data || [];

          const getMaterialUom = (id: number): UnitOfMeasurementType =>
            materials.find((material) => material.id === id)?.units as UnitOfMeasurementType;

          const itemsConverted = fillOrderBillableItemsWithPrices?.map((bi) => {
            let materialUOM = null;

            if (bi.materialId) {
              materialUOM = getMaterialUom(bi.materialId);
            }

            return {
              ...bi,
              quantity:
                isMaterialOrderBillableItem(bi) && materialUOM
                  ? convertKgToUom(bi.quantity, materialUOM)
                  : bi.quantity,
            };
          });

          onChangeBillableItems(itemsConverted);
        }
      } catch (e) {
        showError(e.message);
      }
    },
    [billableItems, fillPrices, material?.id, onChangeBillableItems, type, haulingMaterials],
  );

  const options = useMemo(() => {
    if (!priceGroupsData) {
      return [];
    }

    const {
      haulingPriceGroups: { level, customRatesGroups },
    } = priceGroupsData;
    const options = [];

    if (level === HaulingPriceGroupsResultLevel.Custom && customRatesGroups) {
      customRatesGroups.forEach((customRatesGroup) => {
        options.push({
          label: customRatesGroup.description,
          value: customRatesGroup.id,
        });
      });
    }

    options.push({
      label: t('General Price Group'),
      value: 0,
    });

    return options;
  }, [priceGroupsData, t]);

  if (loadingPriceGroups) {
    return <LoadingInput label={<Trans>Price Group</Trans>} />;
  }

  return (
    <TextField
      disabled={readOnly || !isObject(customer)}
      select
      name="priceGroupId"
      fullWidth
      label={<Trans>Price Group</Trans>}
      required={!readOnly}
      onChange={handlePriceGroupChange}
    >
      {options.map((priceGroup) => (
        <SelectOption key={priceGroup.value} value={priceGroup.value}>
          {priceGroup.label}
        </SelectOption>
      ))}
    </TextField>
  );
};
