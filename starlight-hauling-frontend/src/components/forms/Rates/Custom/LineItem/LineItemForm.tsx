import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  FormInput,
  IGridLayout,
  InfoIcon,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Tooltip,
  Typography,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { isBefore, startOfToday } from 'date-fns';
import { getIn, useFormikContext } from 'formik';
import { capitalize, isDate, noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { HistoryIcon } from '@root/assets';
import { Protected } from '@root/common';
import { NONE_MATERIAL_KEY } from '@root/consts';
import { getUnitLabel } from '@root/helpers';
import { useBusinessContext, useStores, useUserContext } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/types';

import { FormSkeleton, InputOperations, MaterialNavItem } from '../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../helpers';
import BulkRatesEditor from '../BulkRatesEditor/BulkRatesEditor';

import styles from '../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { type ILineItemForm, type IPriceGroupRateLineItemFormikData } from './types';

const today = startOfToday();

const I18N_PATH = 'components.forms.Rates.Custom.Form.';

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
    useFormikContext<IPriceGroupRateLineItemFormikData>();
  const { currencySymbol, formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();

  const { businessLineStore, globalRateStore, lineItemStore, priceGroupStore, materialStore } =
    useStores();

  const { currentUser } = useUserContext();

  const { businessUnitId, businessLineId } = useBusinessContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const selectedPriceGroup = priceGroupStore.selectedEntity;

  const materialsNavigation: NavigationConfigItem<string>[] = useMemo(
    () => [
      { label: 'None Material', key: NONE_MATERIAL_KEY, index: 0 },
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
    [isRecyclingLoB, materialStore.sortedValues],
  );

  useEffect(() => {
    if (!materialStore.loading && materialsNavigation.length && !currentMaterialNavigation) {
      onMaterialChange?.(materialsNavigation[0]);
    }
  }, [currentMaterialNavigation, materialStore.loading, materialsNavigation, onMaterialChange]);

  useEffect(() => {
    if (currentMaterialNavigation && selectedPriceGroup) {
      globalRateStore.requestLineItems({
        businessUnitId,
        businessLineId,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? undefined
            : Number.parseInt(currentMaterialNavigation.key, 10),
      });
      priceGroupStore.requestLineItems({
        businessUnitId,
        businessLineId,
        priceGroupId: selectedPriceGroup.id,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? undefined
            : Number.parseInt(currentMaterialNavigation.key, 10),
      });
    }
  }, [
    currentMaterialNavigation,
    globalRateStore,
    priceGroupStore,
    selectedPriceGroup,
    priceGroupStore.isPreconditionFailed,
    businessUnitId,
    businessLineId,
  ]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.lineItems[index].price ?? 0;
      let operation = values.lineItems[index].operation;

      const lineItem = { ...values.lineItems[index] };

      if (price > 0) {
        operation = operation ?? true;

        lineItem.value = value;
        lineItem.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        lineItem.displayValue = value;
        lineItem.finalPrice = finalPrice;
      }

      setFieldValue(`lineItems[${index}]`, lineItem);
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.lineItems[index].price ?? 0;

      const lineItem = { ...values.lineItems[index] };

      if (price > 0) {
        lineItem.finalPrice = value;

        if (values.lineItems[index].operation === undefined) {
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
      setFieldValue(`lineItems[${index}]`, lineItem);
      setFieldTouched(`lineItems[${index}].value`, true);
    },
    [setFieldValue, setFieldTouched, values],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number) => {
      if (!viewMode) {
        const baseFieldName = `lineItems[${index}]`;
        const price = values.lineItems[index].price ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value = values.lineItems[index].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }
          setFieldTouched(`lineItems[${index}].value`, true);
        }
      }
    },
    [viewMode, values.lineItems, setFieldValue, setFieldTouched],
  );

  const handleShowHistory = useCallback(
    (lineItemId: number, description?: string) => {
      if (selectedPriceGroup && currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          lineItemId,
          materialId:
            currentMaterialNavigation.key === NONE_MATERIAL_KEY
              ? null
              : Number.parseInt(currentMaterialNavigation.key, 10),
          customRatesGroupId: selectedPriceGroup.id,
          entityType: RatesEntityType.customRatesLineItems,
        };

        const materialLabel = materialStore.getById(+currentMaterialNavigation.key)?.description;

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
    viewMode ?? values.bulkEnabled ?? !values.lineItems[index].price;

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
          {priceGroupStore.lineItemsLoading ? (
            <FormSkeleton />
          ) : (
            <Layouts.Box width="100%">
              <BulkRatesEditor
                prop="lineItems"
                currentRates={values.lineItems}
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
              {values.lineItems?.map((lineItem, index) => {
                const lineItemService = lineItemStore.getById(lineItem.lineItemId);
                const nextPrice = lineItem?.nextPrice;
                const effectiveDate = lineItem?.effectiveDate;
                const willChange = effectiveDate && isBefore(today, effectiveDate) && nextPrice;
                const isDisabled = inputDisabled(index);

                return (
                  <Layouts.Padding key={lineItem.lineItemId} top="1" bottom="1">
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
                              handleShowHistory(lineItem.lineItemId, lineItemService?.description)
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
                        <Typography textAlign="right">{formatCurrency(lineItem.price)}</Typography>
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
                          name={`lineItems[${index}].value`}
                          ariaLabel="Value in percents"
                          key="value"
                          value={values.lineItems[index].displayValue}
                          disabled={isDisabled}
                          onBlur={handleBlur}
                          onChange={e => handleValueChange(e, index)}
                          error={getIn(errors.lineItems, `[${index}].value`)}
                          noError={!getIn(errors.lineItems, `[${index}].value`)}
                          wrapClassName={styles.input}
                        />
                      </Layouts.Flex>
                      <Layouts.Flex alignItems="center">
                        {willChange ? (
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
                        ) : null}
                      </Layouts.Flex>
                      <Layouts.Flex justifyContent="flex-end">
                        <FormInput
                          name={`lineItems[${index}].finalPrice`}
                          type="number"
                          ariaLabel="Final price"
                          key="finalPrice"
                          value={values.lineItems[index].finalPrice}
                          disabled={isDisabled}
                          onChange={e => handleFinalPriceChange(e, index)}
                          error={getIn(errors.lineItems, `[${index}].finalPrice`)}
                          noError={!getIn(errors.lineItems, `[${index}].finalPrice`)}
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
