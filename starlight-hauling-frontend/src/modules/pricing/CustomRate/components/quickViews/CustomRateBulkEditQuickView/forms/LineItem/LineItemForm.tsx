import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { intersectionWith, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, FormInput, Typography } from '@root/common';
import { Table } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { FormSkeleton, MaterialNavItem } from '@root/modules/pricing/components';

import { IBulkRatesData } from '../../types';
import { OperationButton } from '../styles';

import styles from '../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { ILineItemForm } from './types';

const I18N_PATH = 'modules.pricing.CustomRate.components.CustomRateBulkEditQuickView.forms.Text.';

const LineItemForm: React.FC<ILineItemForm> = ({
  currentMaterialNavigation,
  lineItems: propsLineItems = [],
  materials: propsMaterials = [],
  onMaterialChange,
}) => {
  const { values } = useFormikContext<IBulkRatesData>();
  const { t } = useTranslation();

  const {
    generalRateStoreNew,
    lineItemStore,
    priceGroupStoreNew,
    materialStore,
    customRateStoreNew,
  } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;

  useEffect(() => {
    if (selectedPriceGroup && currentMaterialNavigation) {
      generalRateStoreNew.filterOneTimeLineItemRatesByParameters({
        materialId: currentMaterialNavigation.key
          ? Number.parseInt(currentMaterialNavigation.key, 10)
          : null,
      });
      customRateStoreNew.filterOneTimeLineItemRatesByParameters({
        materialId: currentMaterialNavigation.key
          ? Number.parseInt(currentMaterialNavigation.key, 10)
          : null,
      });
    }
  }, [
    generalRateStoreNew,
    customRateStoreNew,
    selectedPriceGroup,
    businessUnitId,
    businessLineId,
    customRateStoreNew.isPreconditionFailed,
    currentMaterialNavigation,
  ]);

  const lineItemsValues = useMemo(
    () =>
      propsLineItems.length > 0
        ? intersectionWith(
            values.preview.oneTimeLineItem,
            propsLineItems,
            (_lineItems, _propsLineItems) => _lineItems.lineItemId === _propsLineItems.id,
          )
        : values.preview.oneTimeLineItem,
    [propsLineItems, values.preview.oneTimeLineItem],
  );

  const sortedMaterials = useMemo(
    () =>
      intersectionWith(
        materialStore.sortedValues,
        propsMaterials,
        (_materials, _propsMaterials) => _materials.id === _propsMaterials.id,
      ),
    [materialStore.sortedValues, propsMaterials],
  );

  const materialsNavigation: NavigationConfigItem[] = useMemo(() => {
    const noneMaterial = { label: t('Form.NoneMaterial'), key: null, index: 0 };
    const containsNonMaterial = values.edit.materials?.includes('INCLUDE_NONE_MATERIAL');
    const materials = [
      ...sortedMaterials.map((material, index) => ({
        label: <MaterialNavItem text={material.description} active={material.active} />,
        key: material.id.toString(),
        index: index + 1,
      })),
    ];

    return containsNonMaterial ? [noneMaterial, ...materials] : materials;
  }, [sortedMaterials, t, values.edit.materials]);

  return (
    <>
      <Navigation
        activeTab={currentMaterialNavigation}
        configs={materialStore.loading ? materialsLoadingNavigationConfig : materialsNavigation}
        onChange={onMaterialChange}
        className={styles.materialsNavigation}
        direction="column"
      />
      <Layouts.Box width="100%">
        <Layouts.Padding padding="3" right="0.5" bottom="0">
          {customRateStoreNew.loading ? (
            <FormSkeleton />
          ) : (
            <Table>
              <thead>
                <tr className={styles.tableGrid}>
                  <th>
                    <Layouts.Padding bottom="3">
                      <Typography
                        color="secondary"
                        shade="desaturated"
                        variant="caption"
                        textTransform="uppercase"
                      >
                        {t(`Text.Items`)}
                      </Typography>
                    </Layouts.Padding>
                  </th>
                  <th>
                    <Layouts.Padding bottom="3">
                      <Typography
                        color="secondary"
                        shade="desaturated"
                        variant="caption"
                        textTransform="uppercase"
                        textAlign="right"
                      >
                        {values.edit.source === 'current'
                          ? t(`${I18N_PATH}CurrentPriceGroupRates`)
                          : t(`${I18N_PATH}GeneralRates`)}
                        , $
                      </Typography>
                    </Layouts.Padding>
                  </th>
                  <th>
                    <Layouts.Padding bottom="3">
                      <Typography
                        color="secondary"
                        shade="desaturated"
                        variant="caption"
                        textTransform="uppercase"
                        textAlign="right"
                      >
                        {t(`Text.Value`)}, {values.edit.calculation === 'flat' ? '$' : '%'}
                      </Typography>
                    </Layouts.Padding>
                  </th>
                  <th>
                    <Layouts.Padding bottom="3">
                      <Typography
                        color="secondary"
                        shade="desaturated"
                        variant="caption"
                        textTransform="uppercase"
                        textAlign="right"
                      >
                        {t(`Text.FinalPrice`)}, $
                      </Typography>
                    </Layouts.Padding>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineItemsValues.map((lineItem, index) => {
                  const lineItemService = lineItemStore.getById(lineItem.lineItemId);

                  return (
                    <tr key={lineItem.lineItemId} className={styles.tableGrid}>
                      <td className={styles.cell}>
                        <Layouts.Box maxWidth="220px">
                          <Layouts.Padding bottom="3">
                            <Typography variant="bodyMedium">
                              <Layouts.Flex>
                                {lineItemService?.description}
                                {!lineItemService?.active ? (
                                  <Layouts.Margin left="1">
                                    <Badge color="alert">Inactive</Badge>
                                  </Layouts.Margin>
                                ) : null}
                              </Layouts.Flex>
                            </Typography>
                          </Layouts.Padding>
                        </Layouts.Box>
                      </td>
                      <td className={styles.cell}>
                        <Layouts.Padding bottom="3">
                          <Typography variant="bodyMedium" textAlign="right">
                            {lineItem.price}
                          </Typography>
                        </Layouts.Padding>
                      </td>
                      <td className={styles.cell}>
                        <Layouts.Flex justifyContent="flex-end">
                          <Layouts.Margin right="1">
                            <Layouts.Flex direction="column">
                              <Layouts.Margin bottom="0.5">
                                <OperationButton
                                  position="relative"
                                  as="button"
                                  width="16px"
                                  height="16px"
                                  borderRadius="3px"
                                  backgroundColor="white"
                                  plus
                                  active={values.edit.direction === 'increase'}
                                />
                              </Layouts.Margin>
                              <OperationButton
                                position="relative"
                                as="button"
                                width="16px"
                                height="16px"
                                borderRadius="3px"
                                backgroundColor="white"
                                active={values.edit.direction === 'decrease'}
                              />
                            </Layouts.Flex>
                          </Layouts.Margin>
                          <Layouts.Box width="120px">
                            <FormInput
                              type="number"
                              className={styles.formInput}
                              ariaLabel={
                                values.edit.calculation === 'flat'
                                  ? 'Value in currency'
                                  : 'Value in percents'
                              }
                              name={`preview.oneTimeLineItem[${index}].value`}
                              key="value"
                              value={values.preview.oneTimeLineItem[index].value}
                              disabled
                              onChange={noop}
                            />
                          </Layouts.Box>
                        </Layouts.Flex>
                      </td>
                      <td className={styles.cell}>
                        <Layouts.Flex justifyContent="flex-end">
                          <Layouts.Box width="120px">
                            <FormInput
                              type="number"
                              className={styles.formInput}
                              name={`preview.oneTimeLineItem[${index}].finalPrice`}
                              ariaLabel="Final price"
                              key="finalPrice"
                              value={values.preview.oneTimeLineItem[index].finalPrice}
                              disabled
                              onChange={noop}
                            />
                          </Layouts.Box>
                        </Layouts.Flex>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};

export default observer(LineItemForm);
