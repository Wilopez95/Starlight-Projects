import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewContent, useQuickViewContext } from '@root/common/QuickView';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import { BillableItemActionEnum } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { RatesEntityType } from '@root/modules/pricing/const';
import ratesStyles from '@root/modules/pricing/css/styles.scss';
import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
  SurchargeForm,
  ThresholdForm,
} from '@root/modules/pricing/CustomRate/components/forms';
import {
  getPriceGroupRateDefaultValues,
  getPriceGroupRatesValidationSchema,
  mapPriceGroupRateServiceToFormik,
} from '@root/modules/pricing/CustomRate/components/forms/formikData';
import {
  ILineItemCustomRate,
  IServiceCustomRate,
  ISurchargeCustomRate,
  IThresholdCustomRate,
} from '@root/modules/pricing/CustomRate/types';
import { useNavigation } from '@root/modules/pricing/navigation';
import { ThresholdSettingsType } from '@root/types';

import { IServiceForm } from '../../forms/Service/types';
import { ILineItemForm } from '../../forms/LineItem/types';
import { IRecurringServiceForm } from '../../forms/RecurringService/types';
import { ISurchargeForm } from '../../forms/Surcharge/types';
import { IThresholdForm } from '../../forms/Threshold/types';
import styles from './css/styles.scss';

interface IFormsComponent {
  oneTimeService: React.FC<IServiceForm>;
  recurringService: React.FC<IRecurringServiceForm>;
  oneTimeLineItem: React.FC<ILineItemForm>;
  recurringLineItem: React.FC<ILineItemForm>;
  threshold: React.FC<IThresholdForm>;
  surcharge: React.FC<ISurchargeForm>;
}

const forms: IFormsComponent = {
  oneTimeService: ServiceForm,
  recurringService: RecurringServiceForm,
  oneTimeLineItem: LineItemForm,
  recurringLineItem: RecurringLineItemForm,
  threshold: ThresholdForm,
  surcharge: SurchargeForm,
};

const CustomRateQuickViewContent: React.FC = () => {
  const {
    businessLineStore,
    businessUnitStore,
    generalRateStoreNew,
    priceGroupStoreNew,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    lineItemStore,
    thresholdStore,
    surchargeStore,
    customRateStoreNew,
  } = useStores();

  const { businessLineId, businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const currentBusinessUnit = businessUnitStore.getById(businessUnitId);

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);
  const isRollOff = businessLineStore.isRollOffType(businessLineId);

  const navItems = useNavigation(currentBusinessUnit, isRollOff);

  const [currentMaterialNavigation, setMaterialNavigation] = useState<
    NavigationConfigItem | undefined
  >();

  const [currentEquipmentItemNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem | undefined
  >();

  const [currentThresholdOption, setThresholdOption] = useState<number | undefined>();
  const [thresholdSetting, setThresholdSetting] = useState<ThresholdSettingsType | undefined>();
  const { closeQuickView } = useQuickViewContext();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;

  const handleThresholdOptionChange = useCallback(
    (option?: number) => {
      const thresholdType = thresholdStore.getById(option)?.type;
      const thresholdSettingData = thresholdType
        ? (selectedPriceGroup?.thresholdSetting(thresholdType) as ThresholdSettingsType)
        : undefined;

      setThresholdOption(option);
      setThresholdSetting(thresholdSettingData);
      setMaterialNavigation(undefined);
      setEquipmentItemNavigation(undefined);
    },
    [selectedPriceGroup, thresholdStore],
  );

  const priceGroupRateServices: IServiceCustomRate[] = billableServiceStore.sortedValues
    .filter(
      billableService =>
        billableService.equipmentItem?.id.toString() === currentEquipmentItemNavigation?.key,
    )
    .filter(billableService => {
      if (currentMaterialNavigation?.key === null) {
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
      const service = generalRateStoreNew.rates.oneTimeService?.find(
        serviceDate => serviceDate.billableServiceId === billableService.id,
      );
      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipmentItemDate =>
          equipmentItemDate &&
          equipmentItemDate.id.toString() === currentEquipmentItemNavigation?.key,
      );
      const material = materialStore.sortedValues.find(
        materialData => materialData.id.toString() === currentMaterialNavigation?.key,
      );

      const customService = customRateStoreNew.getOneTimeServiceByBillableServiceId(
        billableService.id,
      );

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          billableServiceId: billableService.id,
          equipmentItemId: equipmentItem!.id,
          materialId: material?.id ?? null,
          price: customService?.price ?? null,
        },
        service?.price ?? null,
      );
    });

  const priceGroupRateLineItems: ILineItemCustomRate[] = lineItemStore.sortedValues
    .filter(lineItem => {
      if (currentMaterialNavigation?.key === null) {
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
      const globalLineItem = generalRateStoreNew.rates.oneTimeLineItem?.find(
        globalLineItemData => globalLineItemData.billableLineItemId === lineItem.id,
      );

      const customLineItem = customRateStoreNew.rates.oneTimeLineItem?.find(
        rate => rate.billableLineItemId === lineItem.id,
      );

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          billableLineItemId: lineItem.id,
          price: customLineItem?.price ?? null,
          materialId: currentMaterialNavigation?.key ? +currentMaterialNavigation.key : null,
        },
        globalLineItem?.price ?? null,
      );
    });

  const priceGroupRateSurcharges: ISurchargeCustomRate[] = surchargeStore.sortedValues.map(
    surcharge => {
      const globalSurcharge = generalRateStoreNew.rates.surcharge?.find(
        globalSurchargeData => globalSurchargeData.surchargeId === surcharge.id,
      );

      const customSurcharge = customRateStoreNew.rates.surcharge?.find(
        rate => rate.surchargeId === surcharge.id,
      );

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          surchargeId: surcharge.id,
          price: customSurcharge?.price ?? null,
          materialId: currentMaterialNavigation?.key ? +currentMaterialNavigation.key : null,
        },
        globalSurcharge?.price ?? null,
      );
    },
  );

  const priceGroupRateThresholds: IThresholdCustomRate[] = thresholdStore.sortedValues
    .filter(threshold =>
      businessLineId
        ? threshold.businessLineId.toString() === businessLineId
        : threshold.id === currentThresholdOption,
    )
    .map(threshold => {
      const globalThreshold = generalRateStoreNew.rates.threshold?.find(
        globalThresholdData => globalThresholdData.thresholdId === threshold.id,
      );
      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipmentItemData =>
          equipmentItemData.id.toString() === currentEquipmentItemNavigation?.key,
      );
      const material = materialStore.sortedValues.find(
        materialData => materialData.id.toString() === currentMaterialNavigation?.key,
      );

      const customThreshold = customRateStoreNew.rates.threshold?.find(
        rate => rate.thresholdId === threshold.id,
      );

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          thresholdId: threshold.id,
          equipmentItemId: equipmentItem?.id,
          materialId: material?.id,
          price: customThreshold?.price ?? null,
          limit: customThreshold?.limit,
        },
        globalThreshold?.price ?? null,
        globalThreshold?.limit,
      );
    });

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<RatesEntityType>>(navItems[0]);

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useEffect(() => {
    materialStore.request({
      equipmentItems: true,
      businessLineId,
    });
    equipmentItemStore.request({ businessLineId });
  }, [materialStore, equipmentItemStore, businessLineId]);

  useEffect(() => {
    if (selectedPriceGroup) {
      customRateStoreNew.request({
        businessUnitId,
        businessLineId,
        entityType: currentTab.key,
        id: selectedPriceGroup.id,
      });
    }
  }, [
    billableServiceStore,
    currentTab.key,
    lineItemStore,
    thresholdStore,
    businessLineId,
    surchargeStore,
    selectedPriceGroup,
    customRateStoreNew,
    businessUnitId,
  ]);

  const getFormikInitialValues = useCallback(
    (tab: RatesEntityType) => {
      switch (tab) {
        case RatesEntityType.oneTimeLineItem:
        case RatesEntityType.recurringLineItem:
          return priceGroupRateLineItems;
        case RatesEntityType.oneTimeService:
        case RatesEntityType.recurringService:
          return priceGroupRateServices;
        case RatesEntityType.threshold:
          return priceGroupRateThresholds;
        case RatesEntityType.surcharge:
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
      getFormikInitialValues(currentTab.key) ?? undefined,
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
                onThresholdChange={handleThresholdOptionChange}
                onThresholdSettingChange={setThresholdSetting}
                currentThresholdSetting={thresholdSetting}
                currentEquipmentItemNavigation={
                  currentEquipmentItemNavigation as NavigationConfigItem<string>
                }
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
          {t('Text.Close')}
        </Button>
      }
    />
  );
};

export default observer(CustomRateQuickViewContent);
