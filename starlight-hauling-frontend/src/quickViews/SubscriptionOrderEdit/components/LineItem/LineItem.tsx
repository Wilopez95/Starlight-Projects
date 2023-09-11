import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableSubscriptionOrder } from '@root/types';

import LineItemSelect from '../LineItemSelect/LineItemSelect';
import MaterialSelect from '../MaterialSelect/MaterialSelect';

import { useCalcLineItemRate } from './hooks';
import { ILineItemComponent } from './types';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.LineItems.';

const LineItem: React.FC<ILineItemComponent> = ({
  index = 0,
  handleRemove,
  lineItem,
  disabled = false,
}) => {
  const { values, errors, handleChange, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionOrder>();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const { calcLineItemRates } = useCalcLineItemRate();

  const handleCalculatePrice = useCallback(
    async (lineItemId: number, materialId?: number | null) => {
      const { price, customRatesGroupLineItemsId, globalRatesLineItemsId } =
        await calcLineItemRates({
          lineItemId,
          materialId,
          serviceMaterialId: values.materialId,
          customRatesGroupId: values.customRatesGroupId,
          businessLineId: values.businessLineId,
        });

      setFieldValue(`lineItems[${index}].globalRatesLineItemsId`, globalRatesLineItemsId);
      setFieldValue(`lineItems[${index}].customRatesGroupLineItemsId`, customRatesGroupLineItemsId);
      setFieldValue(`lineItems[${index}].price`, price);
    },
    [setFieldValue, calcLineItemRates, values, index],
  );

  const handleLineItemChange = useCallback(
    async (id: number, indx: number) => {
      setFieldValue(`lineItems[${indx}].historicalLineItem.originalId`, id);
      setFieldValue(`lineItems[${indx}].billableLineItemId`, id);
      await handleCalculatePrice(id, lineItem.materialId);
    },
    [handleCalculatePrice, setFieldValue, lineItem.materialId],
  );

  const handleMaterialChange = useCallback(
    async (id: number, ind: number) => {
      setFieldValue(`lineItems[${ind}].materialId`, id);
      await handleCalculatePrice(
        lineItem.historicalLineItem?.originalId ?? lineItem.billableLineItemId,
        id || values.materialId,
      );
    },
    [
      setFieldValue,
      values.materialId,
      handleCalculatePrice,
      lineItem.billableLineItemId,
      lineItem.historicalLineItem?.originalId,
    ],
  );

  return (
    <Layouts.Flex justifyContent="space-between">
      <Layouts.Box width="424px" as={Layouts.Flex} justifyContent="space-between">
        <Layouts.Flex direction="column">
          <Layouts.Flex alignItems="center">
            {!disabled ? (
              <Layouts.Margin bottom="4">
                <Layouts.IconLayout remove>
                  <DeleteIcon onClick={handleRemove} />
                </Layouts.IconLayout>
              </Layouts.Margin>
            ) : null}
            <Layouts.Margin right="3">
              {index === 0 ? (
                <Typography
                  as="label"
                  shade="desaturated"
                  color="secondary"
                  variant="bodyMedium"
                  htmlFor={`lineItems[${index}].billableLineItemId`}
                >
                  {t(`${I18N_PATH}LineItem`)}
                </Typography>
              ) : null}
              <Layouts.Box width="150px">
                <LineItemSelect
                  name={`lineItems[${index}].billableLineItemId`}
                  value={lineItem.historicalLineItem?.originalId ?? lineItem.billableLineItemId}
                  error={getIn(errors, `lineItems[${index}].billableLineItemId`)}
                  placeholder={t(`${I18N_PATH}SelectLineItem`)}
                  onSelectChange={(name: string, value: number) => {
                    handleLineItemChange(value, index);
                  }}
                  disabled={disabled}
                />
              </Layouts.Box>
            </Layouts.Margin>
            <Layouts.Margin>
              <Layouts.Box width="170px">
                {index === 0 ? (
                  <Typography
                    as="label"
                    shade="desaturated"
                    color="secondary"
                    variant="bodyMedium"
                    htmlFor={`lineItems[${index}].materialId`}
                  >
                    {t(`${I18N_PATH}Material`)}
                  </Typography>
                ) : null}
                <MaterialSelect
                  placeholder={t(`${I18N_PATH}SelectMaterial`)}
                  name={`lineItems[${index}].materialId`}
                  ariaLabel={t(`Text.Material`)}
                  value={lineItem.materialId ?? undefined}
                  error={getIn(errors, `lineItems[${index}].materialId`)}
                  onSelectChange={(name: string, value: number) => {
                    handleMaterialChange(value, index);
                  }}
                />
              </Layouts.Box>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Flex>
        <Layouts.Margin>
          {index === 0 ? (
            <Typography
              htmlFor={`lineItems[${index}].units`}
              color="secondary"
              as="label"
              shade="desaturated"
              variant="bodyMedium"
            >
              {t(`${I18N_PATH}Unit`)}
            </Typography>
          ) : null}
          <Layouts.Margin top="1">
            <Typography variant="bodyMedium" textAlign="right">
              {startCase(lineItem.historicalLineItem?.unit)}
            </Typography>
          </Layouts.Margin>
        </Layouts.Margin>
      </Layouts.Box>

      <Layouts.Flex justifyContent="flex-end" alignItems="baseline">
        <Layouts.Margin right="2">
          <Layouts.Box width="85px">
            {index === 0 ? (
              <Layouts.Margin right="2">
                <Typography
                  color="secondary"
                  textAlign={values.unlockOverrides ? 'left' : 'right'}
                  shade="desaturated"
                  variant="bodyMedium"
                  htmlFor={`lineItems[${index}].price`}
                >
                  {t(`${I18N_PATH}Price`)}
                </Typography>
              </Layouts.Margin>
            ) : null}
            {values.unlockOverrides ? (
              <FormInput
                name={`lineItems[${index}].price`}
                key={`lineItems[${index}].price`}
                value={lineItem.price}
                error={getIn(errors, `lineItems[${index}].price`)}
                onChange={handleChange}
                disabled={disabled}
              />
            ) : (
              <Layouts.Margin top="1" right="2">
                <Typography variant="bodyMedium" textAlign="right">
                  {formatCurrency(lineItem.price)}
                </Typography>
                <Typography color="alert" variant="bodySmall" textAlign="right">
                  {getIn(errors, `lineItems[${index}].price`)}
                </Typography>
              </Layouts.Margin>
            )}
          </Layouts.Box>
        </Layouts.Margin>
        <Layouts.Margin right="1">
          <Layouts.Box width="75px">
            {index === 0 ? (
              <Typography
                color="secondary"
                as="label"
                shade="desaturated"
                variant="bodyMedium"
                htmlFor={`lineItems[${index}].quantity`}
              >
                {t(`${I18N_PATH}QTY`)}
              </Typography>
            ) : null}
            <FormInput
              name={`lineItems[${index}].quantity`}
              key={`lineItems[${index}].quantity`}
              value={lineItem.quantity}
              type="number"
              limits={{
                min: 1,
              }}
              countable
              disabled={disabled}
              error={getIn(errors, `lineItems[${index}].quantity`)}
              onChange={handleChange}
            />
          </Layouts.Box>
        </Layouts.Margin>
        <Layouts.Box minWidth="75px">
          {index === 0 ? (
            <Layouts.Flex justifyContent="flex-end">
              <Typography
                as="label"
                shade="desaturated"
                color="secondary"
                variant="bodyMedium"
                textAlign="right"
              >
                {t(`${I18N_PATH}Total`)}
              </Typography>
            </Layouts.Flex>
          ) : null}
          <Layouts.Flex justifyContent="flex-end">
            <Layouts.Padding top="2">
              <Typography variant="bodyMedium" textAlign="right">
                {formatCurrency(lineItem.quantity * (lineItem.price ?? 0))}
              </Typography>
            </Layouts.Padding>
          </Layouts.Flex>
        </Layouts.Box>
      </Layouts.Flex>
    </Layouts.Flex>
  );
};

export default observer(LineItem);
