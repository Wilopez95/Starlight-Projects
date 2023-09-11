import React, { useEffect, useMemo, useState } from 'react';
import {
  ISelectOption,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Select,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { calculateFinalPrice, toFixed } from '@root/components/forms/Rates/helpers';
import { NONE_MATERIAL_KEY } from '@root/consts';
import { addressFormat } from '@root/helpers';
import { useBusinessContext, usePrevious, useStores } from '@root/hooks';
import { IPriceGroupRateRecurringLineItem, IRecurringLineItemBillingCycleRate } from '@root/types';

import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
} from '../../forms';
import {
  BulkEditPreviewTab,
  IBulkPreviewPriceGroupRateLineItem,
  IBulkPreviewPriceGroupRateRecurringService,
  IBulkPreviewPriceGroupRateService,
  IBulkRatesData,
} from '../../types';

import { navigationConfig } from './navigationConfig';

const forms = {
  services: ServiceForm,
  lineItems: LineItemForm,
  recurringLineItems: RecurringLineItemForm,
  recurringServices: RecurringServiceForm,
};

const BulkPricingPreviewTab: React.FC = () => {
  const {
    priceGroupStore,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    lineItemStore,
    globalRateStore,
  } = useStores();
  const formik = useFormikContext<IBulkRatesData>();
  const { values, errors, setFieldValue } = formik;
  const { businessUnitId, businessLineId } = useBusinessContext();

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<BulkEditPreviewTab>>(
    navigationConfig[0],
  );

  const [currentMaterialNavigation, setMaterialNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();

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
        currentMaterialNavigation?.key === NONE_MATERIAL_KEY
          ? !billableService.materialBasedPricing
          : billableService.materialBasedPricing,
      )
      .filter(
        billableService =>
          billableService.businessLineId.toString() === businessLineId &&
          billableService.equipmentItem?.id.toString() === currentEquipmentItemNavigationKey,
      )
      .map(billableService => {
        const service = globalRateStore.services.find(
          serviceElement => serviceElement.billableServiceId === billableService.id,
        );

        const equipmentItem = equipmentItemStore.sortedValues.find(
          equipmentItemElement =>
            equipmentItemElement.id.toString() === currentEquipmentItemNavigationKey,
        );
        const material = materialStore.sortedValues.find(
          materialElement => materialElement.id.toString() === currentMaterialNavigationKey,
        );

        const customService = priceGroupStore.priceGroupService(billableService.id);

        const price =
          values.edit.source === 'current'
            ? toFixed(customService?.price ?? 0)
            : toFixed(service?.price ?? 0);
        const { value } = values.edit;
        const direction = values.edit.direction === 'increase';
        const finalPrice =
          values.edit.calculation === 'percentage'
            ? calculateFinalPrice(direction, value, parseFloat(price))
            : toFixed(parseFloat(price) + value * (direction ? 1 : -1));

        return {
          billableServiceId: billableService.id,
          equipmentItemId: equipmentItem?.id,
          materialId: material?.id,
          value,
          price,
          finalPrice,
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
          const service = globalRateStore.recurringServices.find(
            serviceElement => serviceElement.billableServiceId === billableService.id,
          );
          const equipmentItem = equipmentItemStore.sortedValues.find(
            equipmentItemElement =>
              equipmentItemElement.id.toString() === currentEquipmentItemNavigationKey,
          );
          const material = materialStore.sortedValues.find(
            materialElement => materialElement.id.toString() === currentMaterialNavigationKey,
          );
          const customRecurringService = priceGroupStore.priceGroupService(billableService.id);

          return billableService.billingCycles?.map(billingCycle => ({
            billingCycle,
            businessUnitId,
            businessLineId,
            billableServiceId: billableService.id,
            equipmentItemId: equipmentItem?.id,
            materialId: material?.id,
            id: customRecurringService?.id,
            globalRateId: service?.id,
            action: billableService.action,
            value: String(values.edit.value),
          }));
        }),
    [
      billableServiceStore.sortedValues,
      businessLineId,
      businessUnitId,
      currentEquipmentItemNavigationKey,
      currentMaterialNavigationKey,
      equipmentItemStore.sortedValues,
      globalRateStore.recurringServices,
      materialStore.sortedValues,
      priceGroupStore,
      values.edit.value,
    ],
  );

  const priceGroupRateLineItems: Partial<IBulkPreviewPriceGroupRateLineItem>[] =
    lineItemStore.sortedValues
      .filter(lineItem => lineItem.businessLineId.toString() === businessLineId)
      .filter(lineItem =>
        currentMaterialNavigation?.key === NONE_MATERIAL_KEY
          ? !lineItem.materialBasedPricing
          : lineItem.materialBasedPricing,
      )
      .map(lineItem => {
        const globalLineItem = globalRateStore.lineItems.find(
          globalLineItemElement => globalLineItemElement.lineItemId === lineItem.id,
        );

        const customLineItem = priceGroupStore.priceGroupLineItem(lineItem.id);

        const price = toFixed(
          values.edit.source === 'current'
            ? customLineItem?.price ?? 0
            : globalLineItem?.price ?? 0,
        );
        const { value } = values.edit;
        const direction = values.edit.direction === 'increase';
        const finalPrice =
          values.edit.calculation === 'percentage'
            ? calculateFinalPrice(direction, value, parseFloat(price))
            : toFixed(parseFloat(price) + value * (direction ? 1 : -1));

        return {
          lineItemId: lineItem.id,
          value,
          price,
          finalPrice,
        };
      });

  const priceGroupRateRecurringLineItems: Partial<IPriceGroupRateRecurringLineItem>[] | unknown =
    lineItemStore.sortedValues
      .filter(
        lineItem => !lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId,
      )
      .map(lineItem => {
        const globalRecurringLineItem = globalRateStore.recurringLineItems.find(
          globalLineItem => globalLineItem.lineItemId === lineItem.id,
        );

        const customRecurringLineItem = priceGroupStore.priceGroupLineItem(lineItem.id);

        const { value } = values.edit;
        const direction = values.edit.direction === 'increase';

        const recurringLineItem: Partial<IPriceGroupRateRecurringLineItem> | undefined =
          values.edit.source === 'current' ? customRecurringLineItem : globalRecurringLineItem;

        const billingCycles = recurringLineItem?.billingCycles?.map(
          (billingCycle: Partial<IRecurringLineItemBillingCycleRate>) => {
            const price: number = billingCycle?.price ?? 0;
            const finalPrice =
              values.edit.calculation === 'percentage'
                ? calculateFinalPrice(direction, value, price)
                : toFixed(price + value * (direction ? 1 : -1));

            return {
              ...billingCycle,
              finalPrice,
              price,
            };
          },
        );

        return {
          id: globalRecurringLineItem?.id,
          value: value.toString(),
          lineItemId: globalRecurringLineItem?.lineItemId,
          billingCycles,
        };
      });

  useEffect(() => {
    if (
      currentTab.key === 'services' &&
      !isEqual(values.preview.services, priceGroupRateServices)
    ) {
      setFieldValue('preview.services', priceGroupRateServices);
    } else if (
      currentTab.key === 'lineItems' &&
      !isEqual(values.preview.lineItems, priceGroupRateLineItems)
    ) {
      setFieldValue('preview.lineItems', priceGroupRateLineItems);
    } else if (
      currentTab.key === 'recurringServices' &&
      !isEqual(values.preview.recurringServices, priceGroupRateRecurringServices)
    ) {
      setFieldValue('preview.recurringServices', priceGroupRateRecurringServices);
    } else if (
      currentTab.key === 'recurringLineItems' &&
      !isEqual(values.preview.recurringLineItems, priceGroupRateRecurringLineItems)
    ) {
      setFieldValue('preview.recurringLineItems', priceGroupRateRecurringLineItems);
    }
  }, [
    currentTab.key,
    priceGroupRateLineItems,
    priceGroupRateRecurringLineItems,
    priceGroupRateRecurringServices,
    priceGroupRateServices,
    setFieldValue,
    values.preview.lineItems,
    values.preview.recurringLineItems,
    values.preview.recurringServices,
    values.preview.services,
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
    if (
      values.preview.priceGroupId &&
      currentTab.key === 'lineItems' &&
      currentMaterialNavigation
    ) {
      globalRateStore.requestLineItems({
        businessUnitId,
        businessLineId,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? null
            : Number.parseInt(currentMaterialNavigation.key, 10),
      });
      priceGroupStore.requestLineItems({
        businessUnitId,
        businessLineId,
        priceGroupId: values.preview.priceGroupId,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? null
            : Number.parseInt(currentMaterialNavigation.key, 10),
      });
    }
  }, [
    businessLineId,
    businessUnitId,
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    currentTab.key,
    globalRateStore,
    priceGroupStore,
    values.preview.priceGroupId,
  ]);

  useEffect(() => {
    if (
      values.preview.priceGroupId &&
      currentTab.key === 'services' &&
      currentEquipmentItemNavigation &&
      currentMaterialNavigation
    ) {
      if (currentTab.key === 'services') {
        globalRateStore.requestServices({
          businessUnitId,
          businessLineId,
          materialId:
            currentMaterialNavigation.key === NONE_MATERIAL_KEY
              ? null
              : Number.parseInt(currentMaterialNavigation.key, 10),
          equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
        });
      }
      priceGroupStore.requestServices({
        businessLineId,
        businessUnitId,
        equipmentItemId: parseInt(currentEquipmentItemNavigation.key, 10),
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? null
            : parseInt(currentMaterialNavigation.key, 10),
        priceGroupId: values.preview.priceGroupId,
      });
    }
  }, [
    businessLineId,
    businessUnitId,
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    currentTab.key,
    globalRateStore,
    priceGroupStore,
    values.preview.priceGroupId,
  ]);

  useEffect(() => {
    if (values.preview.priceGroupId && currentTab.key === 'lineItems') {
      globalRateStore.requestLineItems({ businessUnitId, businessLineId });
      priceGroupStore.requestLineItems({
        businessUnitId,
        businessLineId,
        priceGroupId: values.preview.priceGroupId,
      });
    }
  }, [
    businessLineId,
    businessUnitId,
    currentTab.key,
    globalRateStore,
    priceGroupStore,
    values.preview.priceGroupId,
  ]);

  useEffect(() => {
    if (currentTab.key === 'services' || currentTab.key === 'recurringServices') {
      materialStore.request({ equipmentItems: true, businessLineId }, true);
    }
  }, [materialStore, businessLineId, currentTab.key]);

  useEffect(() => {
    (async () => {
      switch (currentTab.key) {
        case 'services':
          await billableServiceStore.request({ businessLineId, oneTime: true });
          break;
        case 'lineItems':
          await lineItemStore.request({ businessLineId });
          break;
        case 'recurringLineItems':
          await lineItemStore.request({ businessLineId, oneTime: false });
          break;
        case 'recurringServices':
          await billableServiceStore.request({ businessLineId, oneTime: false });
          break;
        default:
          break;
      }
    })();
  }, [businessLineId, billableServiceStore, currentTab.key, lineItemStore]);

  useEffect(() => {
    priceGroupStore.requestTargetedRateGroups({
      application: values.edit.application,
      applyTo: values.edit.applyTo ?? [],
      businessLineId,
      businessUnitId,
    });
  }, [
    businessLineId,
    businessUnitId,
    priceGroupStore,
    values.edit.application,
    values.edit.applyTo,
  ]);

  useEffect(() => {
    if (!values.preview.priceGroupId) {
      setFieldValue('preview.priceGroupId', priceGroupStore.targetedPriceGroups[0]?.id);
    }
  }, [priceGroupStore.targetedPriceGroups, setFieldValue, values.preview.priceGroupId]);

  const priceGroupOptions: ISelectOption[] = priceGroupStore.targetedPriceGroups.map(priceGroup => {
    const customerHint = priceGroup.customer?.name ? `${priceGroup.customer.name} customer` : '';
    const customerGroupHint = priceGroup.customerGroup
      ? `${priceGroup.customerGroup.description} customer group`
      : '';
    const jobSiteHint = priceGroup.jobSite ? `${addressFormat(priceGroup.jobSite.address)}` : '';

    return {
      value: priceGroup.id,
      label: priceGroup.description,
      hint: customerHint || customerGroupHint || jobSiteHint,
    };
  }, []);

  const CurrentForm = forms[currentTab.key];

  const configs = useMemo(() => {
    if (values.edit.type === 'specificLineItems' || values.edit.type === 'allLineItems') {
      return navigationConfig.filter(config => config.key === 'lineItems');
    }
    if (values.edit.type === 'specificServices' || values.edit.type === 'allServices') {
      return navigationConfig.filter(
        config => config.key === 'services' || config.key === 'recurringServices',
      );
    }
    if (
      values.edit.type === 'specificRecurringLineItems' ||
      values.edit.type === 'allRecurringLineItems'
    ) {
      return navigationConfig.filter(config => config.key === 'recurringLineItems');
    }

    return navigationConfig;
  }, [values.edit.type]);

  useEffect(() => {
    if (previousEditType !== values.edit.type) {
      setCurrentTab(configs[0]);
    }
  }, [configs, previousEditType, values.edit.type]);

  return (
    <>
      <Select
        label="Price Group"
        name="preview.priceGroupId"
        placeholder="Select price group"
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
          onEquipmentItemChange={setEquipmentItemNavigation}
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
