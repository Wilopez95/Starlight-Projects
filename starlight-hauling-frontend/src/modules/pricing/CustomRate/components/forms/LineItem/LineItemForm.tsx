import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  FormInput,
  IGridLayout,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Typography,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { capitalize, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { HistoryIcon } from '@root/assets';
import { Protected } from '@root/common';
import { getUnitLabel } from '@root/helpers';
import { useBusinessContext, useStores, useUserContext } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/modules/pricing/const';

import { FormSkeleton, InputOperations, MaterialNavItem } from '../../../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../../../GeneralRate/helpers';
import BulkRatesEditor from '../BulkRatesEditor/BulkRatesEditor';

import styles from '../../../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { type ILineItemCustomRateFormikData, type ILineItemForm } from './types';

const I18N_PATH = 'modules.pricing.CustomRate.components.forms.Text.';

const gridFormat: IGridLayout = {
  columnGap: '2',
  columns: 'auto 100px 70px 150px 120px 15px 120px',
  rows: '36px',
  alignItems: 'center',
};

const LineItemForm: React.FC<ILineItemForm> = ({
  currentMaterialNavigation,
  onMaterialChange,
  onShowRatesHistory,
  viewMode = false,
}) => {
  const { values, errors, setFieldValue, handleBlur, setFieldTouched } =
    useFormikContext<ILineItemCustomRateFormikData>();
  const { currencySymbol, formatCurrency } = useIntl();
  const { t } = useTranslation();

  const {
    businessLineStore,
    generalRateStoreNew,
    lineItemStore,
    priceGroupStoreNew,
    materialStore,
    customRateStoreNew,
  } = useStores();

  const { currentUser } = useUserContext();

  const { businessUnitId, businessLineId } = useBusinessContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;

  const materialsNavigation: NavigationConfigItem[] = useMemo(
    () => [
      { label: t('Form.NoneMaterial'), key: null, index: 0 },
      ...materialStore.sortedValues
        .filter(
          material =>
            !isRecyclingLoB || material.useForDump || material.useForLoad || material.misc,
        )
        .map((material, index) => ({
          label: <MaterialNavItem text={material.description} active={material.active} />,
          key: material.id.toString(),
          index: index + 1,
        })),
    ],
    [isRecyclingLoB, materialStore.sortedValues, t],
  );

  useEffect(() => {
    if (selectedPriceGroup) {
      generalRateStoreNew.request({
        businessLineId,
        businessUnitId,
        entityType: RatesEntityType.oneTimeLineItem,
      });
      customRateStoreNew.request({
        businessLineId,
        businessUnitId,
        id: selectedPriceGroup.id,
        entityType: RatesEntityType.oneTimeLineItem,
      });
    }
  }, [businessLineId, businessUnitId, customRateStoreNew, generalRateStoreNew, selectedPriceGroup]);

  useEffect(() => {
    if (!materialStore.loading && materialsNavigation.length && !currentMaterialNavigation) {
      onMaterialChange?.(materialsNavigation[0]);
    }
  }, [currentMaterialNavigation, materialStore.loading, materialsNavigation, onMaterialChange]);

  useEffect(() => {
    if (currentMaterialNavigation && selectedPriceGroup) {
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
    currentMaterialNavigation,
    generalRateStoreNew,
    customRateStoreNew,
    selectedPriceGroup,
    customRateStoreNew.isPreconditionFailed,
    businessUnitId,
    businessLineId,
  ]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.oneTimeLineItem[index].price ?? 0;
      let operation = values.oneTimeLineItem[index].operation;

      const lineItem = { ...values.oneTimeLineItem[index] };

      if (price > 0) {
        operation = operation ?? true;

        lineItem.value = value;
        lineItem.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        lineItem.displayValue = value;
        lineItem.finalPrice = finalPrice;
      }

      setFieldValue(`oneTimeLineItem[${index}]`, lineItem);
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.oneTimeLineItem[index].price ?? 0;

      const lineItem = { ...values.oneTimeLineItem[index] };

      if (price > 0) {
        lineItem.finalPrice = value;

        if (values.oneTimeLineItem[index].operation === undefined) {
          lineItem.operation = true;
        }
        const percentage = calculatePercentage(price, +value);

        lineItem.value = percentage;
        if (percentage) {
          lineItem.displayValue = toFixed(+percentage, 3);
          lineItem.operation = +value > price;
        } else {
          lineItem.displayValue = undefined;
          lineItem.operation = undefined;
        }
      }
      setFieldValue(`oneTimeLineItem[${index}]`, lineItem);
      setFieldTouched(`oneTimeLineItem[${index}].value`, true);
    },
    [setFieldValue, setFieldTouched, values],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number) => {
      if (!viewMode) {
        const baseFieldName = `oneTimeLineItem[${index}]`;
        const price = values.oneTimeLineItem[index].price ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value = values.oneTimeLineItem[index].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }
          setFieldTouched(`oneTimeLineItem[${index}].value`, true);
        }
      }
    },
    [viewMode, values.oneTimeLineItem, setFieldValue, setFieldTouched],
  );

  const handleShowHistory = useCallback(
    (lineItemId: number, description?: string) => {
      if (selectedPriceGroup && currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          lineItemId,
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          customRatesGroupId: selectedPriceGroup.id,
          entityType: RatesEntityType.oneTimeLineItem,
        };

        const materialLabel = currentMaterialNavigation.key
          ? materialStore.getById(+currentMaterialNavigation.key)?.description
          : '';

        onShowRatesHistory(ratesHistoryParams, [description, materialLabel].join(' • '));
      }
    },
    [
      businessLineId,
      businessUnitId,
      currentMaterialNavigation,
      materialStore,
      onShowRatesHistory,
      selectedPriceGroup,
    ],
  );

  const inputDisabled = (index: number) =>
    (viewMode || values.bulkEnabled) ?? !values.oneTimeLineItem[index].price;

  return (
    <>
      <Navigation
        activeTab={currentMaterialNavigation}
        configs={materialStore.loading ? materialsLoadingNavigationConfig : materialsNavigation}
        onChange={onMaterialChange}
        className={cx(styles.customerMaterialsNavigation, styles.quickView)}
        direction="column"
      />
      <Layouts.Flex direction="column" as={Layouts.Box} width="80%">
        <Layouts.Padding top="1" right="0.5" bottom="0" left="2">
          {customRateStoreNew.loading ? (
            <FormSkeleton />
          ) : (
            <Layouts.Box width="100%">
              <BulkRatesEditor
                prop={RatesEntityType.oneTimeLineItem}
                currentRates={values.oneTimeLineItem}
                viewMode={viewMode}
                gridFormat={gridFormat}
              />
              <Typography
                textTransform="uppercase"
                variant="headerFive"
                color="secondary"
                shade="desaturated"
              >
                <Layouts.Grid {...gridFormat}>
                  <Layouts.Flex justifyContent="flex-start">
                    {t(`${I18N_PATH}LineItem`)}
                  </Layouts.Flex>
                  <Layouts.Flex justifyContent="flex-start">{t('Text.Type')}</Layouts.Flex>
                  <Layouts.Flex justifyContent="flex-end">{t(`${I18N_PATH}Unit`)}</Layouts.Flex>
                  <Layouts.Flex as={Layouts.Margin} right="2" justifyContent="flex-end">
                    {t(`${I18N_PATH}GeneralPrice`)}, {currencySymbol}
                  </Layouts.Flex>
                  <Layouts.Flex justifyContent="flex-end">{t(`${I18N_PATH}Value`)}</Layouts.Flex>
                  <Layouts.Box />
                  <Layouts.Flex justifyContent="flex-end">
                    {t(`${I18N_PATH}FinalPrice`)}
                    {currencySymbol}
                  </Layouts.Flex>
                </Layouts.Grid>
              </Typography>
              {values.oneTimeLineItem?.map((lineItem, index) => {
                const lineItemService = lineItemStore.getById(lineItem.billableLineItemId);
                const isDisabled = inputDisabled(index);

                return (
                  <Layouts.Padding key={lineItem.billableLineItemId} top="1" bottom="1">
                    <Layouts.Grid {...gridFormat} className={styles.historyLabel}>
                      <Layouts.Flex alignItems="center">
                        {lineItemService?.description}
                        {!lineItemService?.active ? (
                          <Badge color="alert" className={styles.inactive}>
                            {t('Text.Inactive')}
                          </Badge>
                        ) : null}
                        <Protected permissions="configuration/price-groups:view-history:perform">
                          <HistoryIcon
                            className={styles.rateHistoryIcon}
                            onClick={() =>
                              handleShowHistory(
                                lineItem.billableLineItemId,
                                lineItemService?.description,
                              )
                            }
                          />
                        </Protected>
                      </Layouts.Flex>
                      <Typography textAlign="left">{startCase(lineItemService?.type)}</Typography>
                      <Typography textAlign="right">
                        {capitalize(
                          getUnitLabel(lineItemService?.unit, currentUser?.company?.unit),
                        )}
                      </Typography>
                      <Layouts.Margin right="2">
                        <Typography textAlign="right">
                          {lineItem.price ? formatCurrency(lineItem.price) : null}
                        </Typography>
                      </Layouts.Margin>
                      <Layouts.Flex direction="row" justifyContent="flex-end">
                        <Layouts.Padding right="0.5">
                          <InputOperations
                            active={lineItem.operation}
                            disabled={isDisabled}
                            onIncrement={() => handleOperationChange(true, index)}
                            onDecrement={() => handleOperationChange(false, index)}
                          />
                        </Layouts.Padding>
                        <FormInput
                          type="number"
                          name={`oneTimeLineItem[${index}].value`}
                          ariaLabel="Value in percents"
                          key="value"
                          value={values.oneTimeLineItem[index].displayValue}
                          disabled={isDisabled}
                          onBlur={handleBlur}
                          onChange={e => handleValueChange(e, index)}
                          error={getIn(errors.oneTimeLineItem, `[${index}].value`)}
                          noError={!getIn(errors.oneTimeLineItem, `[${index}].value`)}
                          wrapClassName={styles.input}
                        />
                      </Layouts.Flex>
                      <Layouts.Flex alignItems="center">
                        {/* {willChange && (
                          <Layouts.Box>
                            <Tooltip
                              text={t(`${I18N_PATH}EffectiveDateTooltip`, {
                                price: formatCurrency(nextPrice),
                                date:
                                  (isDate(effectiveDate) && formatDateTime(effectiveDate).date) ??
                                  '',
                              })}
                            >
                              <InfoIcon className={styles.infoIcon} onClick={noop} />
                            </Tooltip>
                          </Layouts.Box>
                        )} */}
                      </Layouts.Flex>
                      <Layouts.Flex justifyContent="flex-end">
                        <FormInput
                          name={`oneTimeLineItem[${index}].finalPrice`}
                          type="number"
                          ariaLabel="Final price"
                          key="finalPrice"
                          value={values.oneTimeLineItem[index].finalPrice}
                          disabled={isDisabled}
                          onChange={e => handleFinalPriceChange(e, index)}
                          error={getIn(errors.oneTimeLineItem, `[${index}].finalPrice`)}
                          noError={!getIn(errors.oneTimeLineItem, `[${index}].finalPrice`)}
                          wrapClassName={styles.input}
                        />
                      </Layouts.Flex>
                    </Layouts.Grid>
                  </Layouts.Padding>
                );
              })}
            </Layouts.Box>
          )}
        </Layouts.Padding>
      </Layouts.Flex>
    </>
  );
};

export default observer(LineItemForm);
