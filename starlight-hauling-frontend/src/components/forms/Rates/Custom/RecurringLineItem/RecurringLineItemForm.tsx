import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IGridLayout,
  InfoIcon,
  Layouts,
  Tooltip,
  Typography,
} from '@starlightpro/shared-components';
import { isBefore, startOfDay, startOfToday } from 'date-fns';
import { getIn, useFormikContext } from 'formik';
import { capitalize, isDate, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput } from '@root/common';
import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/types';

import { FormSkeleton, InputOperations } from '../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../helpers';
import BulkRatesEditor from '../BulkRatesEditor/BulkRatesEditor';

import styles from '../../css/styles.scss';
import { type ILineItemForm, type IPriceGroupRateRecurringLineItemFormikData } from './types';

const today = startOfToday();

const I18N_PATH = 'components.forms.Rates.Custom.Form.';

const gridFormat: IGridLayout = {
  columns: 'auto 100px 150px 120px 15px 120px',
  rows: '36px',
  alignItems: 'center',
  gap: '2',
};

const RecurringLineItemForm: React.FC<ILineItemForm> = ({
  onShowRatesHistory,
  viewMode = false,
}) => {
  const { t } = useTranslation();
  const { values, errors, setFieldValue, handleBlur, setFieldTouched } =
    useFormikContext<IPriceGroupRateRecurringLineItemFormikData>();

  const { globalRateStore, lineItemStore, priceGroupStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { currencySymbol, formatCurrency, formatDateTime } = useIntl();

  const selectedPriceGroup = priceGroupStore.selectedEntity;

  useEffect(() => {
    if (selectedPriceGroup) {
      globalRateStore.requestRecurringLineItems({ businessUnitId, businessLineId });
      priceGroupStore.requestLineItems({
        businessUnitId,
        businessLineId,
        priceGroupId: selectedPriceGroup.id,
      });
    }
  }, [
    globalRateStore,
    priceGroupStore,
    selectedPriceGroup,
    businessUnitId,
    businessLineId,
    priceGroupStore.isPreconditionFailed,
  ]);

  const handleValueChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
      billingCycleIndex: number,
    ) => {
      const { value } = e.target;
      const price = values.recurringLineItems[index].billingCycles[billingCycleIndex].price ?? 0;
      let operation = values.recurringLineItems[index].operation;

      const billingCycleRate = {
        ...values.recurringLineItems[index].billingCycles[billingCycleIndex],
      };

      if (price > 0) {
        operation = operation ?? true;

        billingCycleRate.value = value;
        billingCycleRate.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        billingCycleRate.displayValue = value;
        billingCycleRate.finalPrice = finalPrice;
      }

      setFieldValue(
        `recurringLineItems[${index}].billingCycles[${billingCycleIndex}]`,
        billingCycleRate,
      );
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
      billingCycleIndex: number,
    ) => {
      const { value } = e.target;
      const price = values.recurringLineItems[index].billingCycles[billingCycleIndex].price ?? 0;

      const billingCycleRate = {
        ...values.recurringLineItems[index].billingCycles[billingCycleIndex],
      };

      if (price > 0) {
        billingCycleRate.finalPrice = value;

        if (
          values.recurringLineItems[index].billingCycles[billingCycleIndex].operation === undefined
        ) {
          billingCycleRate.operation = true;
        }
        const percentage = calculatePercentage(price, +value);

        billingCycleRate.value = percentage;
        if (percentage) {
          billingCycleRate.displayValue = toFixed(+percentage, 3);
          billingCycleRate.operation = +value > price;
        } else {
          billingCycleRate.displayValue = undefined;
          billingCycleRate.operation = undefined;
        }
      }

      setFieldValue(
        `recurringLineItems[${index}].billingCycles[${billingCycleIndex}]`,
        billingCycleRate,
      );
      setFieldTouched(
        `recurringLineItems[${index}].billingCycles[${billingCycleIndex}].value`,
        true,
      );
    },
    [setFieldValue, setFieldTouched, values],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number, billingCycleIndex: number) => {
      if (!viewMode) {
        const baseFieldName = `recurringLineItems[${index}].billingCycles[${billingCycleIndex}]`;
        const price = values.recurringLineItems[index].billingCycles[billingCycleIndex].price ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value =
            values.recurringLineItems[index].billingCycles[billingCycleIndex].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }

          setFieldTouched(
            `recurringLineItems[${index}].billingCycles[${billingCycleIndex}].value`,
            true,
          );
        }
      }
    },
    [viewMode, values.recurringLineItems, setFieldValue, setFieldTouched],
  );

  const handleShowHistory = useCallback(
    (lineItemId: number, billingCycle?: string, description?: string) => {
      const ratesHistoryParams = {
        businessUnitId,
        businessLineId,
        lineItemId,
        billingCycle,
        customRatesGroupId: selectedPriceGroup?.id,
        entityType: RatesEntityType.customRatesRecurringLineItems,
      };

      onShowRatesHistory(ratesHistoryParams, [description].join(' • '));
    },
    [businessLineId, businessUnitId, onShowRatesHistory, selectedPriceGroup?.id],
  );

  const inputDisabled = (index: number, billingCycleIndex: number) =>
    viewMode ??
    values.bulkEnabled ??
    !values.recurringLineItems[index].billingCycles[billingCycleIndex].price;

  return (
    <Layouts.Box width="100%">
      <Layouts.Padding top="1" left="1">
        {priceGroupStore.lineItemsLoading ? (
          <FormSkeleton />
        ) : (
          <>
            <BulkRatesEditor
              prop="recurringLineItems"
              currentRates={values.recurringLineItems}
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
                  {t(`${I18N_PATH}RecurringLineItem`)}
                </Layouts.Flex>
                <Layouts.Flex justifyContent="flex-end">
                  {t(`${I18N_PATH}BillingCycle`)}
                </Layouts.Flex>
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
            {values.recurringLineItems?.map((recurringLineItem, index) => {
              const lineItemService = lineItemStore.getById(recurringLineItem.lineItemId);

              return recurringLineItem.billingCycles.map((billingCycleObj, billingCycleIndex) => {
                const valueInputPath = `recurringLineItems[${index}].billingCycles[${billingCycleIndex}].value`;
                const finalPriceInputPath = `recurringLineItems[${index}].billingCycles[${billingCycleIndex}].finalPrice`;
                const nextPrice = billingCycleObj?.nextPrice;
                const effectiveDate = substituteLocalTimeZoneInsteadUTC(
                  billingCycleObj?.effectiveDate,
                );
                const willChange =
                  effectiveDate && isBefore(today, startOfDay(effectiveDate)) && nextPrice;

                return (
                  <Layouts.Padding key={valueInputPath} top="1" bottom="1">
                    <Layouts.Grid {...gridFormat} className={styles.historyLabel}>
                      <Layouts.Flex alignItems="center">
                        {lineItemService?.description}
                        {!lineItemService?.active ? (
                          <Badge color="alert" className={styles.inactive}>
                            {t('Text.Inactive')}
                          </Badge>
                        ) : null}
                        <HistoryIcon
                          className={styles.rateHistoryIcon}
                          onClick={() =>
                            handleShowHistory(
                              recurringLineItem.lineItemId,
                              billingCycleObj.billingCycle,
                              lineItemService?.description,
                            )
                          }
                        />
                      </Layouts.Flex>
                      <Typography textAlign="right">
                        {capitalize(billingCycleObj.billingCycle)}
                      </Typography>
                      <Layouts.Margin right="2">
                        <Typography textAlign="right">
                          {billingCycleObj.price ? `$${billingCycleObj.price}` : null}
                        </Typography>
                      </Layouts.Margin>
                      <Layouts.Flex direction="row" justifyContent="flex-end">
                        <Layouts.Padding right="0.5">
                          <InputOperations
                            onDecrement={() =>
                              handleOperationChange(false, index, billingCycleIndex)
                            }
                            onIncrement={() =>
                              handleOperationChange(true, index, billingCycleIndex)
                            }
                            active={billingCycleObj.operation}
                            disabled={inputDisabled(index, billingCycleIndex)}
                          />
                        </Layouts.Padding>
                        <FormInput
                          type="number"
                          name={valueInputPath}
                          ariaLabel="Value in percents"
                          key="value"
                          value={
                            values.recurringLineItems[index].billingCycles[billingCycleIndex]
                              .displayValue
                          }
                          disabled={inputDisabled(index, billingCycleIndex)}
                          onChange={e => handleValueChange(e, index, billingCycleIndex)}
                          onBlur={handleBlur}
                          error={getIn(errors, valueInputPath)}
                          noError={!getIn(errors, valueInputPath)}
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
                          type="number"
                          name={finalPriceInputPath}
                          ariaLabel="Final price"
                          key="finalPrice"
                          value={
                            values.recurringLineItems[index].billingCycles[billingCycleIndex]
                              .finalPrice
                          }
                          disabled={inputDisabled(index, billingCycleIndex)}
                          onChange={e => handleFinalPriceChange(e, index, billingCycleIndex)}
                          error={getIn(errors, finalPriceInputPath)}
                          noError={!getIn(errors, finalPriceInputPath)}
                          wrapClassName={styles.input}
                        />
                      </Layouts.Flex>
                    </Layouts.Grid>
                  </Layouts.Padding>
                );
              });
            })}
          </>
        )}
      </Layouts.Padding>
    </Layouts.Box>
  );
};

export default observer(RecurringLineItemForm);
