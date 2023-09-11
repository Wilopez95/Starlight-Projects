import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ISelectOption,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Select,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { isEmpty, isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useBusinessContext, usePrevious, useStores } from '@root/hooks';
import { RatesEntityType } from '@root/modules/pricing/const';
import { IRecurringLineItemCustomRate } from '@root/modules/pricing/CustomRate/types';
import { IBillableItemPricingPreview } from '@root/modules/pricing/PriceGroup/api/types';

import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
} from '../../forms';
import { defineTarget } from '../../helper';
import {
  BulkEditPreviewTab,
  IBulkPreviewPriceGroupRateLineItem,
  IBulkPreviewPriceGroupRateRecurringService,
  IBulkPreviewPriceGroupRateService,
  IBulkRatesData,
} from '../../types';

import { IServiceForm } from '../../forms/Service/types';
import { ILineItemForm } from '../../forms/LineItem/types';
import { LineItem } from '../../../../../../../../stores/entities';
import { IRecurringServiceForm } from '../../forms/RecurringService/types';
import { navigationConfig } from './navigationConfig';

interface IForm {
  oneTimeService: React.FC<IServiceForm>;
  oneTimeLineItem: React.FC<ILineItemForm>;
  recurringLineItem: React.FC<{ lineItems: LineItem[] }>;
  recurringService: React.FC<IRecurringServiceForm>;
}

const forms: IForm = {
  oneTimeService: ServiceForm,
  oneTimeLineItem: LineItemForm,
  recurringLineItem: RecurringLineItemForm,
  recurringService: RecurringServiceForm,
};

const I18N_PATH =
  'modules.pricing.CustomRate.components.CustomRateBulkEditQuickView.tabs.PreviewTab.Text.';

const BulkPricingPreviewTab: React.FC = () => {
  const {
    priceGroupStoreNew,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    lineItemStore,
  } = useStores();
  const formik = useFormikContext<IBulkRatesData>();
  const { values, errors, setFieldValue } = formik;
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<BulkEditPreviewTab>>(
    navigationConfig[0],
  );

  const [currentMaterialNavigation, setMaterialNavigation] = useState<NavigationConfigItem>();

  const [currentEquipmentItemNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();

  const previousEditType = usePrevious(values.edit.type);

  const materials = useMemo(() => {
    const selectedMaterials = values.edit.materials?.includes('INCLUDE_ALL')
      ? materialStore.sortedValues
      : materialStore.sortedValues.filter(material => values.edit.materials?.includes(material.id));

    return selectedMaterials;
  }, [materialStore.sortedValues, values.edit.materials]);

  const currentMaterialNavigationKey = currentMaterialNavigation?.key;
  const currentEquipmentItemNavigationKey = currentEquipmentItemNavigation?.key;

  const priceGroupRateServices: Partial<IBulkPreviewPriceGroupRateService>[] =
    billableServiceStore.sortedValues
      .filter(billableService =>
        currentMaterialNavigation?.key === null
          ? !billableService.materialBasedPricing
          : billableService.materialBasedPricing,
      )
      .filter(
        billableService =>
          billableService.oneTime &&
          billableService.businessLineId.toString() === businessLineId &&
          billableService.equipmentItemId.toString() === currentEquipmentItemNavigationKey,
      )
      .map(billableService => {
        const equipmentItem = equipmentItemStore.sortedValues.find(
          equipmentItemData =>
            equipmentItemData.id.toString() === currentEquipmentItemNavigationKey,
        );
        const material = materialStore.sortedValues.find(
          materialData => materialData.id.toString() === currentMaterialNavigationKey,
        );

        const materialId = material?.id ? material.id : null;

        const calculatedService = priceGroupStoreNew.pricingUpdatesPreview.oneTimeService?.find(
          service =>
            service.billableServiceId === billableService.id &&
            service.materialId === materialId &&
            service.priceGroupId === values.preview.priceGroupId,
        );

        return {
          billableServiceId: billableService.id,
          equipmentItemId: equipmentItem?.id,
          materialId: material?.id,
          value: values.edit.value,
          price: calculatedService?.basePrice,
          finalPrice: calculatedService?.price,
        };
      });

  const priceGroupRateRecurringServices: (
    | Partial<IBulkPreviewPriceGroupRateRecurringService>
    | undefined
  )[] = useMemo(
    () =>
      billableServiceStore.sortedValues
        .filter(
          billableService =>
            !billableService.oneTime &&
            billableService.equipmentItem?.id.toString() === currentEquipmentItemNavigationKey,
        )
        .flatMap(billableService => {
          const calculatedRecurringServices =
            priceGroupStoreNew.pricingUpdatesPreview.recurringService?.filter(
              recurringService =>
                recurringService.billableServiceId === billableService.id &&
                recurringService.priceGroupId === values.preview.priceGroupId,
            );

          const equipmentItem = equipmentItemStore.sortedValues.find(
            equipmentItemData =>
              equipmentItemData.id.toString() === currentEquipmentItemNavigationKey,
          );

          const material = materialStore.sortedValues.find(
            materialData => materialData.id.toString() === currentMaterialNavigationKey,
          );

          return calculatedRecurringServices?.map(service => ({
            billingCycle: service.billingCycle,
            businessUnitId,
            businessLineId,
            billableServiceId: billableService.id,
            equipmentItemId: equipmentItem?.id,
            materialId: material?.id,
            action: billableService.action,
            value: String(values.edit.value),
          }));
        }),
    [
      values.preview.priceGroupId,
      priceGroupStoreNew.pricingUpdatesPreview.recurringService,
      billableServiceStore.sortedValues,
      currentEquipmentItemNavigationKey,
      equipmentItemStore.sortedValues,
      materialStore.sortedValues,
      currentMaterialNavigationKey,
      businessUnitId,
      businessLineId,
      values.edit.value,
    ],
  );

  const priceGroupRateLineItems: Partial<IBulkPreviewPriceGroupRateLineItem>[] =
    lineItemStore.sortedValues
      .filter(lineItem =>
        currentMaterialNavigation?.key === null
          ? !lineItem.materialBasedPricing
          : lineItem.materialBasedPricing,
      )
      .filter(lineItem => lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId)
      .map(lineItem => {
        const materialId = currentMaterialNavigation?.key
          ? Number(currentMaterialNavigation.key)
          : null;
        const calculatedLineItem = priceGroupStoreNew.pricingUpdatesPreview.oneTimeLineItem?.find(
          currentLineItem =>
            currentLineItem.billableLineItemId === lineItem.id &&
            currentLineItem.materialId === materialId &&
            currentLineItem.priceGroupId === values.preview.priceGroupId,
        );

        return {
          lineItemId: lineItem.id,
          value: values.edit.value,
          price: calculatedLineItem?.basePrice,
          finalPrice: calculatedLineItem?.price,
        };
      });

  const priceGroupRateRecurringLineItems: Partial<IRecurringLineItemCustomRate>[] | unknown =
    lineItemStore.sortedValues
      .filter(
        lineItem => !lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId,
      )
      .map(lineItem => {
        const calculatedRecurringLineItem =
          priceGroupStoreNew.pricingUpdatesPreview.recurringLineItem?.filter(
            recurringLineItem =>
              recurringLineItem.billableLineItemId === lineItem.id &&
              recurringLineItem.priceGroupId === values.preview.priceGroupId,
          );

        const billingCyclePrices = calculatedRecurringLineItem?.map(lineItemData => ({
          billingCycle: lineItemData.billingCycle,
          price: lineItemData.basePrice,
          finalPrice: lineItemData.price,
        }));

        return {
          id: lineItem.id,
          value: values.edit.value.toString(),
          billableLineItemId: lineItem.id,
          billingCyclePrices,
        };
      });

  useEffect(() => {
    if (
      currentTab.key === RatesEntityType.oneTimeService &&
      !isEqual(values.preview.oneTimeService, priceGroupRateServices)
    ) {
      setFieldValue(`preview.${RatesEntityType.oneTimeService}`, priceGroupRateServices);
    } else if (
      currentTab.key === RatesEntityType.oneTimeLineItem &&
      !isEqual(values.preview.oneTimeLineItem, priceGroupRateLineItems)
    ) {
      setFieldValue(`preview.${RatesEntityType.oneTimeLineItem}`, priceGroupRateLineItems);
    } else if (
      currentTab.key === RatesEntityType.recurringService &&
      !isEqual(values.preview.recurringService, priceGroupRateRecurringServices)
    ) {
      setFieldValue(`preview.${RatesEntityType.recurringService}`, priceGroupRateRecurringServices);
    } else if (
      currentTab.key === RatesEntityType.recurringLineItem &&
      !isEqual(values.preview.recurringLineItem, priceGroupRateRecurringLineItems)
    ) {
      setFieldValue(
        `preview.${RatesEntityType.recurringLineItem}`,
        priceGroupRateRecurringLineItems,
      );
    }
  }, [
    currentTab.key,
    priceGroupRateLineItems,
    priceGroupRateRecurringLineItems,
    priceGroupRateRecurringServices,
    priceGroupRateServices,
    setFieldValue,
    values.preview.oneTimeLineItem,
    values.preview.oneTimeService,
    values.preview.recurringLineItem,
    values.preview.recurringService,
  ]);

  const equipments = useMemo(
    () =>
      values.edit.type === 'allServices'
        ? equipmentItemStore.sortedValues.filter(
            equipment =>
              values.edit.equipmentItems?.[0] === 0 ||
              values.edit.equipmentItems?.includes(equipment.id),
          )
        : [],
    [equipmentItemStore.sortedValues, values.edit.equipmentItems, values.edit.type],
  );

  const services = useMemo(
    () =>
      values.edit.type === 'specificServices'
        ? billableServiceStore.sortedValues.filter(service =>
            values.edit.services?.includes(service.id),
          )
        : [],
    [billableServiceStore.sortedValues, values.edit.services, values.edit.type],
  );

  const lineItems = useMemo(
    () =>
      values.edit.type === 'specificLineItems'
        ? lineItemStore.sortedValues.filter(lineItem =>
            values.edit.lineItems?.includes(lineItem.id),
          )
        : [],
    [lineItemStore.sortedValues, values.edit.lineItems, values.edit.type],
  );

  useEffect(() => {
    (async () => {
      switch (currentTab.key) {
        case RatesEntityType.oneTimeService:
          await billableServiceStore.request({ businessLineId, oneTime: true }, true);
          break;
        case RatesEntityType.oneTimeLineItem:
          await lineItemStore.request({ businessLineId, oneTime: true });
          break;
        case RatesEntityType.recurringService:
          await billableServiceStore.request({ businessLineId, oneTime: false }, true);
          break;
        case RatesEntityType.recurringLineItem:
          await lineItemStore.request({ businessLineId, oneTime: false });
          break;
        default:
          return null;
      }
    })();
  }, [businessLineId, billableServiceStore, currentTab.key, lineItemStore]);

  useEffect(() => {
    const priceValueMultiplier = values.edit.direction === 'increase' ? 1 : -1;

    priceGroupStoreNew.requestPreview({
      businessUnitId,
      businessLineId,
      application: values.edit.application,
      target: defineTarget(values.edit.type),
      value: values.edit.value * priceValueMultiplier,
      source: values.edit.source,
      calculation: values.edit.calculation,
      services: values.edit.services,
      lineItems: values.edit.lineItems,
      equipmentItems: values.edit.equipmentItems,
      materials: values.edit.materials,
      applyTo: values.edit.applyTo,
      effectiveDate: values.edit.effectiveDate,
    });
  }, [
    businessUnitId,
    businessLineId,
    values.edit.application,
    values.edit.direction,
    values.edit.type,
    values.edit.value,
    values.edit.source,
    values.edit.calculation,
    values.edit.services,
    values.edit.lineItems,
    values.edit.equipmentItems,
    values.edit.materials,
    values.edit.applyTo,
    values.edit.effectiveDate,
    priceGroupStoreNew,
  ]);

  const priceGroupOptions: ISelectOption[] = useMemo(() => {
    if (isEmpty(priceGroupStoreNew.pricingUpdatesPreview)) {
      return [];
    }

    const pricesGroupsList: IBillableItemPricingPreview[] = Object.values(
      priceGroupStoreNew.pricingUpdatesPreview,
    ).reduce(
      (agg: IBillableItemPricingPreview[], valuesData: IBillableItemPricingPreview[]) => [
        ...agg,
        ...valuesData,
      ],
      [],
    );

    const uniquePriceGroups = pricesGroupsList?.reduce(
      (agg: Record<string, ISelectOption>, priceGroup: IBillableItemPricingPreview) => {
        if (agg[priceGroup.priceGroupId]) {
          return agg;
        }

        return {
          ...agg,
          [priceGroup.priceGroupId]: {
            value: priceGroup.priceGroupId,
            label: priceGroup.priceGroupDescription ?? '',
            hint: priceGroup.hint ?? '',
          },
        };
      },
      {},
    );

    return Object.values(uniquePriceGroups);
  }, [priceGroupStoreNew.pricingUpdatesPreview]);

  const CurrentForm = forms[currentTab.key];

  const configs = useMemo(() => {
    if (values.edit.type === 'specificLineItems' || values.edit.type === 'allLineItems') {
      return navigationConfig.filter(config => config.key === RatesEntityType.oneTimeLineItem);
    }
    if (values.edit.type === 'specificServices' || values.edit.type === 'allServices') {
      return navigationConfig.filter(
        config =>
          config.key === RatesEntityType.oneTimeService ||
          config.key === RatesEntityType.recurringService,
      );
    }
    if (
      values.edit.type === 'specificRecurringLineItems' ||
      values.edit.type === 'allRecurringLineItems'
    ) {
      return navigationConfig.filter(config => config.key === RatesEntityType.recurringLineItem);
    }

    return navigationConfig;
  }, [values.edit.type]);

  useEffect(() => {
    if (previousEditType !== values.edit.type) {
      setCurrentTab(configs[0]);
    }
  }, [configs, previousEditType, values.edit.type]);

  useEffect(() => {
    if (!values.preview.priceGroupId) {
      setFieldValue('preview.priceGroupId', priceGroupOptions[0]?.value);
    }
  }, [priceGroupOptions, setFieldValue, values.preview.priceGroupId]);

  return (
    <>
      <Select
        label={t(`${I18N_PATH}PriceGroup`)}
        name="preview.priceGroupId"
        placeholder={t(`${I18N_PATH}PriceGroupPlaceholder`)}
        key="priceGroupId"
        options={priceGroupOptions}
        value={values.preview.priceGroupId}
        error={errors.preview?.priceGroupId}
        onSelectChange={setFieldValue}
        nonClearable
      />
      <Navigation activeTab={currentTab} configs={configs} onChange={setCurrentTab} />
      <Layouts.Flex as={Layouts.Box} minHeight="100%">
        <CurrentForm
          onEquipmentItemChange={
            setEquipmentItemNavigation as (config: NavigationConfigItem) => void
          }
          onMaterialChange={setMaterialNavigation}
          currentEquipmentItemNavigation={currentEquipmentItemNavigation}
          currentMaterialNavigation={currentMaterialNavigation}
          materials={materials}
          equipments={equipments}
          services={services}
          lineItems={lineItems}
        />
      </Layouts.Flex>
    </>
  );
};

export default observer(BulkPricingPreviewTab);
