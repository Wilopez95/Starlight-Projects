import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem, Select } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import {
  FormSkeleton,
  MaterialNavItem,
  MaterialNotLinked,
} from '@root/components/forms/Rates/components';
import navigationStyles from '@root/components/forms/Rates/css/styles.scss';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { IThirdPartyHaulerCostsFormData } from './formikData';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfig';
import { IThirdPartyHaulerRateQuickViewRightPanel } from './types';

const ThirdPartyHaulerRateQuickViewRightPanel: React.FC<
  IThirdPartyHaulerRateQuickViewRightPanel
> = ({
  businessLineId,
  businessLineOptions,
  onChangeBusinessLineId,
  currentEquipmentItemNavigation,
  currentMaterialNavigation,
  onChangeEquipmentNavigation,
  onChangeMaterialNavigation,
}) => {
  const { thirdPartyHaulerStore, materialStore, equipmentItemStore, billableServiceStore } =
    useStores();
  const { t } = useTranslation();
  const { currencySymbol } = useIntl();
  const thirdPartyHauler = thirdPartyHaulerStore.selectedEntity;

  const materialsItemsNavigation: NavigationConfigItem[] = useMemo(
    () => [
      { label: 'All Services & Materials', key: null, index: 0 },
      ...materialStore.sortedValues.map((material, index) => ({
        label: <MaterialNavItem text={material.description} active={material.active} />,
        key: material.id.toString(),
        index: index + 1,
      })),
    ],
    [materialStore.sortedValues],
  );

  const equipmentItemsNavigation: NavigationConfigItem<string>[] = equipmentItemStore.sortedValues
    .filter(equipmentItem => +equipmentItem.businessLineId === +businessLineId)
    .map((equipmentItem, index) => ({
      label: equipmentItem.shortDescription,
      key: equipmentItem.id.toString(),
      index,
    }));

  useEffect(() => {
    if (thirdPartyHauler) {
      materialStore.cleanup();
      materialStore.request({ businessLineId, equipmentItems: true });
      thirdPartyHaulerStore.requestThirdPartyHaulerCosts(+thirdPartyHauler.id, +businessLineId);
    }
  }, [businessLineId, thirdPartyHauler, materialStore, thirdPartyHaulerStore]);

  useEffect(() => {
    if (thirdPartyHauler && currentEquipmentItemNavigation) {
      billableServiceStore.cleanup();
      billableServiceStore.request(
        {
          businessLineId,
          oneTime: true,
          equipmentItemIds: [+currentEquipmentItemNavigation.key],
        },
        true,
      );
    }
  }, [businessLineId, billableServiceStore, thirdPartyHauler, currentEquipmentItemNavigation]);

  useEffect(() => {
    if (
      !currentEquipmentItemNavigation &&
      !equipmentItemStore.loading &&
      equipmentItemsNavigation.length
    ) {
      onChangeEquipmentNavigation(equipmentItemsNavigation[0]);
    }

    if (!materialStore.loading && materialsItemsNavigation.length && !currentMaterialNavigation) {
      onChangeMaterialNavigation(materialsItemsNavigation[0]);
    }
  }, [
    equipmentItemStore.loading,
    equipmentItemsNavigation,
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    materialStore.loading,
    materialsItemsNavigation,
    onChangeEquipmentNavigation,
    onChangeMaterialNavigation,
  ]);

  const isMaterialLinked = useMemo(() => {
    if (
      currentMaterialNavigation &&
      currentEquipmentItemNavigation &&
      currentMaterialNavigation.key !== null
    ) {
      const material = materialStore.getById(+currentMaterialNavigation.key);

      return material?.equipmentItemIds?.some(
        equipmentItemId => equipmentItemId === +currentEquipmentItemNavigation.key,
      );
    }

    return false;
  }, [currentEquipmentItemNavigation, currentMaterialNavigation, materialStore]);

  const { values, errors, handleChange } = useFormikContext<IThirdPartyHaulerCostsFormData>();

  return (
    <Layouts.Flex as={Layouts.Box} overflowHidden direction="column">
      <Layouts.Padding top="5" left="3" right="3">
        <Layouts.Box as={Layouts.Flex} justifyContent="space-between" width="100%">
          <Typography variant="headerThree">{startCase(thirdPartyHauler?.description)}</Typography>
          <Layouts.Flex flexGrow={1} alignItems="center" justifyContent="flex-end">
            <Typography as="label" htmlFor="lineOfBusiness" shade="light">
              {t('Text.LineOfBusiness')}
            </Typography>
            <Layouts.Box maxWidth="200px" width="100%">
              <Layouts.Margin left="2">
                <Select
                  name="lineOfBusiness"
                  options={businessLineOptions}
                  value={businessLineId}
                  onSelectChange={onChangeBusinessLineId}
                  nonClearable
                  noErrorMessage
                />
              </Layouts.Margin>
            </Layouts.Box>
          </Layouts.Flex>
        </Layouts.Box>
      </Layouts.Padding>
      <Divider both />
      <Layouts.Grid columns="320px auto" as={Layouts.Box} overflowHidden>
        <Layouts.Scroll>
          <Navigation
            activeTab={currentMaterialNavigation}
            configs={
              materialStore.loading || equipmentItemStore.loading
                ? materialsLoadingNavigationConfig
                : materialsItemsNavigation
            }
            onChange={onChangeMaterialNavigation}
            className={navigationStyles.materialsNavigation}
            direction="column"
          />
        </Layouts.Scroll>
        <Layouts.Scroll>
          <Navigation
            activeTab={currentEquipmentItemNavigation}
            configs={
              equipmentItemStore.loading || materialStore.loading
                ? equipmentItemsLoadingNavigationConfig
                : equipmentItemsNavigation
            }
            onChange={onChangeEquipmentNavigation}
            className={navigationStyles.equipmentItemsNavigation}
            carousel
          />
          {currentMaterialNavigation && currentEquipmentItemNavigation ? (
            <Layouts.Margin top="3" left="3">
              {billableServiceStore.loading ? (
                <FormSkeleton />
              ) : (
                <>
                  {!isMaterialLinked && currentMaterialNavigation.key !== null ? (
                    <MaterialNotLinked businessLineId={businessLineId} />
                  ) : (
                    <Layouts.Padding right="3">
                      <Layouts.Flex as={Layouts.Padding} bottom="3" justifyContent="space-between">
                        <Typography
                          color="secondary"
                          as="label"
                          shade="light"
                          variant="headerFive"
                          textTransform="uppercase"
                        >
                          {t('Text.Service')}
                        </Typography>
                        <Typography
                          color="secondary"
                          as="label"
                          shade="light"
                          variant="headerFive"
                          textTransform="uppercase"
                        >
                          {t('Text.Cost', { currencySymbol })}
                        </Typography>
                      </Layouts.Flex>
                      <FieldArray name="thirdPartyHaulerCosts">
                        {() =>
                          values.thirdPartyHaulerCosts.map((thirdPartyHaulerCost, index) => {
                            const billableService = billableServiceStore.getById(
                              thirdPartyHaulerCost.billableServiceId,
                            );

                            if (!billableService) {
                              return null;
                            }

                            return (
                              <Layouts.Box
                                key={index}
                                as={Layouts.Flex}
                                justifyContent="space-between"
                              >
                                <Layouts.Flex justifyContent="flex-start" alignItems="baseline">
                                  {billableService.description}
                                  {!billableService?.active ? (
                                    <Layouts.Margin left="1">
                                      <Badge color="alert">{t('Text.Inactive')}</Badge>
                                    </Layouts.Margin>
                                  ) : null}
                                </Layouts.Flex>
                                <Layouts.Box width="120px">
                                  <FormInput
                                    type="number"
                                    name={`thirdPartyHaulerCosts[${index}].cost`}
                                    value={thirdPartyHaulerCost.cost}
                                    onChange={handleChange}
                                    error={getIn(errors, `thirdPartyHaulerCosts[${index}].cost`)}
                                  />
                                </Layouts.Box>
                              </Layouts.Box>
                            );
                          })
                        }
                      </FieldArray>
                    </Layouts.Padding>
                  )}
                </>
              )}
            </Layouts.Margin>
          ) : null}
        </Layouts.Scroll>
      </Layouts.Grid>
    </Layouts.Flex>
  );
};

export default observer(ThirdPartyHaulerRateQuickViewRightPanel);
