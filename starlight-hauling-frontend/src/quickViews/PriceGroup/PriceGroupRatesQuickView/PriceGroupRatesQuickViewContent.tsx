import React, { useCallback, useEffect, useState } from 'react';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewContent, useQuickViewContext } from '@root/common/QuickView';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import ratesStyles from '@root/components/forms/Rates/css/styles.scss';
import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
  SurchargeForm,
  ThresholdForm,
} from '@root/components/forms/Rates/Custom';
import {
  getPriceGroupRateDefaultValues,
  getPriceGroupRatesValidationSchema,
  mapPriceGroupRateServiceToFormik,
} from '@root/components/forms/Rates/Custom/formikData';
import {
  FormikPriceGroupRate,
  PriceGroupRateType,
} from '@root/components/forms/Rates/Custom/types';
import { useNavigation } from '@root/components/forms/Rates/hooks';
import { BillableItemActionEnum, NONE_MATERIAL_KEY } from '@root/consts';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';
import {
  IPriceGroupRateLineItem,
  IPriceGroupRateService,
  IPriceGroupRateSurcharge,
  IPriceGroupRateThreshold,
  ThresholdSettingsType,
} from '@root/types';

import { RatesConfigType } from '../types';

import styles from '../css/styles.scss';

const forms = {
  services: ServiceForm,
  recurringServices: RecurringServiceForm,
  lineItems: LineItemForm,
  recurringLineItems: RecurringLineItemForm,
  thresholds: ThresholdForm,
  surcharges: SurchargeForm,
};

const PriceGroupRatesQuickViewContent: React.FC = () => {
  const {
    businessLineStore,
    businessUnitStore,
    globalRateStore,
    priceGroupStore,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    lineItemStore,
    thresholdStore,
    surchargeStore,
  } = useStores();

  const { businessLineId, businessUnitId } = useBusinessContext();

  const currentBusinessUnit = businessUnitStore.getById(businessUnitId);

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);
  const isRollOff = businessLineStore.isRollOffType(businessLineId);

  const navItems = useNavigation(currentBusinessUnit, isRollOff);

  const [currentMaterialNavigation, setMaterialNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();

  const [currentEquipmentItemNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();

  const [currentThresholdOption, setThresholdOption] = useState<number | undefined>();
  const [thresholdSetting, setThresholdSetting] = useState<ThresholdSettingsType>();
  const { closeQuickView } = useQuickViewContext();

  useCleanup(materialStore);
  useCleanup(equipmentItemStore);

  const selectedPriceGroup = priceGroupStore.selectedEntity;

  const onThresholdOptionChange = useCallback(
    (option?: number) => {
      const thresholdType = thresholdStore.getById(option)?.type;
      const thresholdSettingType = thresholdType
        ? selectedPriceGroup?.thresholdSetting(thresholdType)
        : undefined;

      setThresholdOption(option);
      setThresholdSetting(thresholdSettingType);
      setMaterialNavigation(undefined);
      setEquipmentItemNavigation(undefined);
    },
    [selectedPriceGroup, thresholdStore],
  );

  const priceGroupRateServices: FormikPriceGroupRate<IPriceGroupRateService>[] =
    billableServiceStore.sortedValues
      .filter(
        billableService =>
          billableService.equipmentItem?.id.toString() === currentEquipmentItemNavigation?.key,
      )
      .filter(billableService => {
        if (currentMaterialNavigation?.key === NONE_MATERIAL_KEY) {
          return !billableService.materialBasedPricing;
        }

        if (isRecyclingLoB && billableService.materialBasedPricing) {
          const material = materialStore.getById(currentMaterialNavigation?.key);

          if (material?.useForDump && billableService.action === BillableItemActionEnum.dump) {
            return true;
          }

          if (material?.useForLoad && billableService.action === BillableItemActionEnum.load) {
            return true;
          }

          return false;
        }

        return billableService.materialBasedPricing;
      })
      .map(billableService => {
        const service = globalRateStore.services.find(
          serviceElement => serviceElement.billableServiceId === billableService.id,
        );
        const equipmentItem = equipmentItemStore.sortedValues.find(
          equipmentItemElement =>
            equipmentItemElement.id.toString() === currentEquipmentItemNavigation?.key,
        );
        const material = materialStore.sortedValues.find(
          materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
        );

        const customService = priceGroupStore.priceGroupService(billableService.id);

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            billableServiceId: billableService.id,
            equipmentItemId: equipmentItem?.id,
            materialId: material?.id,
            price: customService?.price,
          },
          service?.price,
        );
      });

  const priceGroupRateLineItems: FormikPriceGroupRate<IPriceGroupRateLineItem>[] =
    lineItemStore.sortedValues
      .filter(lineItem => {
        if (currentMaterialNavigation?.key === NONE_MATERIAL_KEY) {
          return !lineItem.materialBasedPricing;
        }

        if (
          isRecyclingLoB &&
          lineItem.materialBasedPricing &&
          lineItem.type === 'miscellaneousItem'
        ) {
          if (lineItem.materialIds?.length) {
            const material = materialStore.getById(currentMaterialNavigation?.key);

            return material?.misc && lineItem.materialIds.includes(material.id);
          }

          return false;
        }

        return lineItem.materialBasedPricing;
      })
      .map(lineItem => {
        const globalLineItem = globalRateStore.lineItems.find(
          globalLineItemElement => globalLineItemElement.lineItemId === lineItem.id,
        );

        const customLineItem = priceGroupStore.priceGroupLineItem(lineItem.id);

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            lineItemId: lineItem.id,
            price: customLineItem?.price,
          },
          globalLineItem?.price,
        );
      });

  const priceGroupRateSurcharges: FormikPriceGroupRate<IPriceGroupRateSurcharge>[] =
    surchargeStore.sortedValues.map(surcharge => {
      const globalSurcharge = globalRateStore.surcharges.find(
        globalSurchargeElement => globalSurchargeElement.surchargeId === surcharge.id,
      );

      const customSurcharge = priceGroupStore.priceGroupSurcharge(surcharge.id);

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          surchargeId: surcharge.id,
          price: customSurcharge?.price,
        },
        globalSurcharge?.price,
      );
    });

  const priceGroupRateThresholds: FormikPriceGroupRate<IPriceGroupRateThreshold>[] =
    thresholdStore.sortedValues
      .filter(threshold =>
        businessLineId
          ? threshold.businessLineId.toString() === businessLineId
          : threshold.id === currentThresholdOption,
      )
      .map(threshold => {
        const globalThreshold = globalRateStore.thresholds.find(
          globalThresholdElement => globalThresholdElement.thresholdId === threshold.id,
        );
        const equipmentItem = equipmentItemStore.sortedValues.find(
          equipmentItemElement =>
            equipmentItemElement.id.toString() === currentEquipmentItemNavigation?.key,
        );
        const material = materialStore.sortedValues.find(
          materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
        );

        const defaultLimit = isRecyclingLoB ? 1 : undefined;

        const customThreshold = priceGroupStore.priceGroupThreshold(threshold.id);

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            thresholdId: threshold.id,
            equipmentItemId: equipmentItem?.id,
            materialId: material?.id,
            price: customThreshold?.price,
            limit: customThreshold?.limit ?? defaultLimit,
          },
          globalThreshold?.price,
          globalThreshold?.limit,
        );
      });

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<RatesConfigType>>(
    navItems[0] as NavigationConfigItem<RatesConfigType>,
  );

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useEffect(() => {
    materialStore.request({
      equipmentItems: true,
      businessLineId: businessLineId || selectedPriceGroup?.businessLineId,
    });
    equipmentItemStore.request({
      businessLineId: businessLineId || selectedPriceGroup?.businessLineId,
    });
  }, [materialStore, equipmentItemStore, businessLineId, selectedPriceGroup?.businessLineId]);

  useEffect(() => {
    switch (currentTab.key) {
      case 'services':
        billableServiceStore.request({ businessLineId, oneTime: true });
        break;
      case 'recurringServices':
        billableServiceStore.request({ businessLineId, oneTime: false });
        break;
      case 'lineItems':
        lineItemStore.request({ businessLineId, oneTime: true });
        break;
      case 'recurringLineItems':
        lineItemStore.request({ businessLineId, oneTime: false });
        break;
      case 'thresholds':
        thresholdStore.request({ businessLineId });
        break;
      case 'surcharges':
        surchargeStore.request({ businessLineId });
        break;
      default:
        return undefined;
    }
  }, [
    billableServiceStore,
    currentTab.key,
    lineItemStore,
    thresholdStore,
    businessLineId,
    surchargeStore,
  ]);

  const getFormikInitialValues = useCallback(
    (tab: RatesConfigType) => {
      switch (tab) {
        case 'lineItems':
        case 'recurringLineItems':
          return priceGroupRateLineItems;
        case 'services':
        case 'recurringServices':
          return priceGroupRateServices;
        case 'thresholds':
          return priceGroupRateThresholds;
        case 'surcharges':
          return priceGroupRateSurcharges;
        default:
          return null;
      }
    },
    [
      priceGroupRateLineItems,
      priceGroupRateServices,
      priceGroupRateThresholds,
      priceGroupRateSurcharges,
    ],
  );

  const formik = useFormik({
    validationSchema: getPriceGroupRatesValidationSchema(currentTab.key),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: getPriceGroupRateDefaultValues(
      currentTab.key,
      getFormikInitialValues(currentTab.key) as unknown as PriceGroupRateType[],
    ),
    onSubmit: noop,
  });

  const CurrentForm = forms[currentTab.key];

  return (
    <QuickViewContent
      rightPanelElement={
        <>
          <Layouts.Padding padding="3">
            <div className={tableQuickViewStyles.quickViewTitle}>
              {selectedPriceGroup?.description}
            </div>
          </Layouts.Padding>
          <Navigation activeTab={currentTab} configs={navItems} onChange={setCurrentTab} />

          <Layouts.Scroll>
            <FormContainer formik={formik} className={ratesStyles.formContainer}>
              <CurrentForm
                onEquipmentItemChange={setEquipmentItemNavigation}
                onMaterialChange={setMaterialNavigation}
                onThresholdChange={onThresholdOptionChange}
                onThresholdSettingChange={setThresholdSetting}
                currentThresholdSetting={thresholdSetting}
                currentEquipmentItemNavigation={currentEquipmentItemNavigation}
                currentMaterialNavigation={currentMaterialNavigation}
                currentThresholdOption={currentThresholdOption}
                onShowRatesHistory={noop}
                viewMode
              />
            </FormContainer>
          </Layouts.Scroll>
        </>
      }
      actionsElement={
        <Button variant="primary" className={styles.closeButton} onClick={closeQuickView}>
          Close
        </Button>
      }
    />
  );
};

export default observer(PriceGroupRatesQuickViewContent);
