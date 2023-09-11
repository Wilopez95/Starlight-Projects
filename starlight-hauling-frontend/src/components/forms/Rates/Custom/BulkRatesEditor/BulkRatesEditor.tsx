import React, { useCallback } from 'react';
import { Checkbox, IGridLayout, Layouts, TextInputElement } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import validator from 'validator';

import { FormInput } from '@root/common';
import { Divider } from '@root/common/TableTools';
import {
  type IPriceGroupRateLineItem,
  type IPriceGroupRateRecurringLineItem,
  type IPriceGroupRateRecurringService,
  type IPriceGroupRateService,
} from '@root/types';

import { InputOperations } from '../../components';
import { calculateFinalPrice } from '../../helpers';
import { type IPriceGroupRateLineItemFormikData } from '../LineItem/types';
import { type IPriceGroupRateRecurringLineItemFormikData } from '../RecurringLineItem/types';
import { type IPriceGroupRecurringServiceFormikData } from '../RecurringService/types';
import { type IPriceGroupServiceFormikData } from '../Service/types';
import { FormikPriceGroupRate } from '../types';

interface IBulkRatesEditor {
  prop: 'services' | 'recurringServices' | 'lineItems' | 'recurringLineItems';
  currentRates: FormikPriceGroupRate<
    | IPriceGroupRateService
    | IPriceGroupRateRecurringService
    | IPriceGroupRateLineItem
    | IPriceGroupRateRecurringLineItem
  >[];
  gridFormat?: IGridLayout;
  viewMode?: boolean;
}

const BulkRatesEditor: React.FC<IBulkRatesEditor> = ({
  prop,
  currentRates,
  gridFormat,
  viewMode = false,
}) => {
  const { values, setFieldValue, setErrors, errors } = useFormikContext<
    | IPriceGroupRateRecurringLineItemFormikData
    | IPriceGroupServiceFormikData
    | IPriceGroupRecurringServiceFormikData
    | IPriceGroupRateLineItemFormikData
  >();

  const handleBulkToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked;

      setFieldValue('bulkEnabled', value);
      setFieldValue('bulkValue', '');
      setErrors({});
    },
    [setFieldValue, setErrors],
  );

  const handleBulkValueChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      const value = e.target.value;

      setFieldValue('bulkValue', value);
      setFieldValue(
        prop,
        currentRates.map(rateItem => ({
          ...rateItem,
          value: rateItem.price ? value : '',
          displayValue: rateItem.price ? value : '',
          operation: rateItem.price ? rateItem.operation ?? true : undefined,
          finalPrice:
            rateItem.price && validator.isNumeric(value)
              ? calculateFinalPrice(rateItem.operation ?? true, +value, rateItem.price)
              : '',
          billingCycles: (rateItem as IPriceGroupRateRecurringLineItem).billingCycles?.map(
            billingCycleObj => {
              return {
                ...billingCycleObj,
                value: billingCycleObj.price ? value : '',
                displayValue: billingCycleObj.price ? value : '',
                operation: billingCycleObj.price ? billingCycleObj.operation ?? true : undefined,
                finalPrice:
                  billingCycleObj.price && validator.isNumeric(value)
                    ? calculateFinalPrice(
                        billingCycleObj.operation ?? true,
                        +value,
                        billingCycleObj.price,
                      )
                    : '',
              };
            },
          ),
          frequencies: (rateItem as IPriceGroupRateRecurringService).frequencies?.map(frequency => {
            return {
              ...frequency,
              value: frequency.price ? value : '',
              displayValue: frequency.price ? value : '',
              operation: frequency.price ? frequency.operation ?? true : undefined,
              finalPrice:
                frequency.price && validator.isNumeric(value)
                  ? calculateFinalPrice(frequency.operation ?? true, +value, +frequency.price)
                  : '',
            };
          }),
        })),
      );
    },
    [currentRates, prop, setFieldValue],
  );

  const handleBulkOperationChange = useCallback(
    (operation: boolean) => {
      if (values.bulkEnabled) {
        const bulkValue = values.bulkValue;

        setFieldValue('bulkOperation', operation);
        setFieldValue(
          prop,
          currentRates.map(rateItem => ({
            ...rateItem,
            operation: rateItem.price ? operation : undefined,
            finalPrice:
              rateItem.price && bulkValue && validator.isNumeric(bulkValue)
                ? calculateFinalPrice(operation, +bulkValue, rateItem.price)
                : '',
            billingCycles: (rateItem as IPriceGroupRateRecurringLineItem).billingCycles?.map(
              billingCycleObj => {
                return {
                  ...billingCycleObj,
                  operation: billingCycleObj.price ? operation : undefined,
                  finalPrice:
                    billingCycleObj.price && bulkValue && validator.isNumeric(bulkValue)
                      ? calculateFinalPrice(operation, +bulkValue, +billingCycleObj.price)
                      : '',
                };
              },
            ),
            frequencies: (rateItem as IPriceGroupRateRecurringService).frequencies?.map(
              frequency => {
                return {
                  ...frequency,
                  operation: frequency.price ? operation : undefined,
                  finalPrice:
                    frequency.price && bulkValue && validator.isNumeric(bulkValue)
                      ? calculateFinalPrice(operation, +bulkValue, +frequency.price)
                      : '',
                };
              },
            ),
          })),
        );
      }
    },
    [currentRates, prop, setFieldValue, values.bulkEnabled, values.bulkValue],
  );

  const isDisabled = viewMode || !values.bulkEnabled;

  return (
    <Layouts.Margin top="1" bottom="1">
      <Layouts.Grid {...gridFormat}>
        <Layouts.Box>
          <Checkbox
            name="bulkEnabled"
            onChange={handleBulkToggle}
            value={values.bulkEnabled}
            disabled={viewMode}
          >
            Apply Group Rate
          </Checkbox>
        </Layouts.Box>
        <Layouts.Box />
        {prop === 'lineItems' || prop === 'recurringLineItems' ? <Layouts.Box /> : null}
        <Layouts.Flex direction="row" justifyContent="flex-end">
          <Layouts.Padding right="0.5">
            <InputOperations
              active={values.bulkOperation}
              disabled={isDisabled}
              onIncrement={() => handleBulkOperationChange(true)}
              onDecrement={() => handleBulkOperationChange(false)}
            />
          </Layouts.Padding>
          <FormInput
            type="number"
            name="bulkValue"
            ariaLabel="Bulk value"
            value={values.bulkValue}
            disabled={isDisabled}
            onChange={handleBulkValueChange}
            error={errors.bulkValue}
            noError={!errors.bulkValue}
          />
        </Layouts.Flex>
        <Layouts.Box />
      </Layouts.Grid>
      <Layouts.Padding top="1" bottom="1" />
      <Divider bottom />
    </Layouts.Margin>
  );
};

export default BulkRatesEditor;
