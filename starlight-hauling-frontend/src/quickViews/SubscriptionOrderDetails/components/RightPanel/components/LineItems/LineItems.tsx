import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { IOrderRatesCalculateRequest, OrderService } from '@root/api';
import { DeleteIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableSubscriptionOrder } from '@root/types';
import { useBusinessContext, useStores } from '@hooks';

const I18N_PATH =
  'quickViews.SubscriptionOrderDetails.components.RightPanel.components.LineItems.Text.';

const LineItems: React.FC = () => {
  const { values, errors, setFieldValue, handleChange } =
    useFormikContext<IConfigurableSubscriptionOrder>();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();
  const { lineItemStore, materialStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  useEffect(() => {
    if (values.businessLineId) {
      lineItemStore.request({ businessLineId: values.businessLineId });
    }
  }, [lineItemStore, values.businessLineId]);

  const lineItemOptions: ISelectOption[] = useMemo(() => {
    return lineItemStore.sortedValues
      .filter(item => item.oneTime)
      .map(lineItem => ({
        label: lineItem.description,
        value: lineItem.id,
      }));
  }, [lineItemStore.sortedValues]);

  const materialOptions: ISelectOption[] = useMemo(() => {
    return materialStore.sortedValues.map(material => ({
      label: material.description,
      value: material.id,
      hint: material.manifested ? t(`Text.Manifested`) : '',
    }));
  }, [materialStore.sortedValues, t]);

  const calculateLineItemRates = useCallback(
    (lineItems: { lineItemId: number; materialId?: number | null }[], lineItemIndex: number) => {
      const payload: IOrderRatesCalculateRequest = {
        businessUnitId: +businessUnitId,
        businessLineId: values.businessLineId,
        type: values.customRatesGroupServicesId ? 'custom' : 'global',
        billableLineItems: lineItems.length ? lineItems : undefined,
        customRatesGroupId: values.customRatesGroupServicesId,
      };

      if (lineItems) {
        (async () => {
          const rates = await OrderService.calculateRates(payload);
          const lineItemId = lineItems[lineItemIndex].lineItemId;
          const materialId = lineItems[lineItemIndex].materialId;

          if (rates) {
            const global = rates.globalRates;
            const custom = rates.customRates;

            const globalRate = global?.globalRatesLineItems?.find(
              globalRateElement =>
                globalRateElement.lineItemId === lineItemId &&
                (globalRateElement.materialId === materialId ||
                  globalRateElement.materialId === null),
            );
            const customRate = custom?.customRatesLineItems?.find(
              customRateElement => customRateElement.lineItemId === lineItemId,
            );

            setFieldValue(`newLineItems[${lineItemIndex}].billableLineItemId`, lineItemId);

            setFieldValue(`newLineItems[${lineItemIndex}].globalRatesLineItemsId`, globalRate?.id);
            setFieldValue(
              `newLineItems[${lineItemIndex}].customRatesGroupLineItemsId`,
              customRate?.id,
            );
            setFieldValue(
              `newLineItems[${lineItemIndex}].price`,
              customRate?.price ?? globalRate?.price ?? 0,
            );
          }
        })();
      }
    },
    [businessUnitId, values.businessLineId, values.customRatesGroupServicesId, setFieldValue],
  );

  const getLineItemsCalcRatesPayload = useCallback(() => {
    return (
      values.newLineItems?.map(lineItem => {
        const billableLineItem = lineItemStore.getById(lineItem.historicalLineItem?.originalId);

        return {
          lineItemId: lineItem.historicalLineItem?.originalId ?? lineItem.billableLineItemId,
          materialId: billableLineItem?.materialBasedPricing
            ? lineItem.materialId ?? 0 ?? values.materialId
            : undefined,
        };
      }) ?? []
    );
  }, [lineItemStore, values]);

  const handleLineItemChange = useCallback(
    (id: number, index: number) => {
      setFieldValue(`newLineItems[${index}].billableLineItemId`, id);
      setFieldValue(`newLineItems[${index}].historicalLineItem.originalId`, id);
      setFieldValue(`newLineItems[${index}].materialId`, undefined);

      const billableLineItem = lineItemStore.getById(id);
      const lineItems = getLineItemsCalcRatesPayload();

      lineItems.splice(index, 1, {
        lineItemId: id,
        materialId: billableLineItem?.materialBasedPricing ? values.materialId : undefined,
      });

      if (
        billableLineItem &&
        (!billableLineItem?.materialBasedPricing ||
          (billableLineItem?.materialBasedPricing && values.materialId))
      ) {
        calculateLineItemRates(lineItems, index);
      } else {
        setFieldValue(`newLineItems[${index}].price`, undefined);
      }
    },
    [
      calculateLineItemRates,
      getLineItemsCalcRatesPayload,
      lineItemStore,
      setFieldValue,
      values.materialId,
    ],
  );

  const handleLineItemMaterialChange = useCallback(
    (materialId: number, index: number) => {
      const lineItems = getLineItemsCalcRatesPayload();

      if (values.newLineItems) {
        const lineItem = values.newLineItems[index];
        const billableLineItem = lineItemStore.getById(lineItem.historicalLineItem?.originalId);

        if (
          !billableLineItem?.materialBasedPricing ||
          (billableLineItem.materialBasedPricing && (materialId || values.materialId))
        ) {
          lineItems.splice(index, 1, {
            lineItemId: lineItem.historicalLineItem?.originalId ?? lineItem.billableLineItemId,
            materialId: billableLineItem?.materialBasedPricing
              ? materialId || values.materialId
              : undefined,
          });
          lineItem.billableLineItemId && calculateLineItemRates(lineItems, index);
        } else {
          setFieldValue(`newLineItems[${index}].price`, undefined);
        }
      }
    },
    [getLineItemsCalcRatesPayload, lineItemStore, calculateLineItemRates, setFieldValue, values],
  );

  return (
    <>
      <Layouts.Margin top="3">
        <Typography color="secondary">{t(`${I18N_PATH}LineItems`)}</Typography>
      </Layouts.Margin>
      {values.lineItems ? (
        <FieldArray name="lineItems">
          {({ remove }) => {
            return values.lineItems?.map((lineItem, index) => (
              <Layouts.Flex justifyContent="space-between" key={index}>
                <Layouts.Box width="424px" as={Layouts.Flex} justifyContent="space-between">
                  <Layouts.Flex direction="column">
                    {index === 0 ? (
                      <Layouts.Margin left="3">
                        <Layouts.Padding left="0.5">
                          <Typography
                            as="label"
                            shade="desaturated"
                            color="secondary"
                            variant="bodyMedium"
                          >
                            {t(`${I18N_PATH}LineItems`)}
                          </Typography>
                        </Layouts.Padding>
                      </Layouts.Margin>
                    ) : null}
                    <Layouts.Flex alignItems="center">
                      <Layouts.Margin bottom="2">
                        <Layouts.IconLayout remove>
                          <DeleteIcon onClick={() => remove(index)} />
                        </Layouts.IconLayout>
                      </Layouts.Margin>

                      <Layouts.Margin right="3" bottom="2">
                        {startCase(lineItem.historicalLineItem?.description)}
                      </Layouts.Margin>
                    </Layouts.Flex>
                  </Layouts.Flex>
                  <Layouts.Flex direction="column">
                    {index === 0 ? (
                      <Layouts.Margin right="2">
                        <Layouts.Padding>
                          <Typography
                            as="label"
                            shade="desaturated"
                            color="secondary"
                            variant="bodyMedium"
                          >
                            {t(`${I18N_PATH}Material`)}
                          </Typography>
                        </Layouts.Padding>
                      </Layouts.Margin>
                    ) : null}
                    <Layouts.Flex>
                      <Layouts.Margin bottom="2">
                        {startCase(
                          materialStore.sortedValues.find(item => item.id === lineItem.materialId)
                            ?.description,
                        )}
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
                        {t(`Text.Unit`)}
                      </Typography>
                    ) : null}
                    <Layouts.Margin top="1" bottom="2">
                      <Typography variant="bodyMedium" textAlign="right">
                        {startCase(lineItem.historicalLineItem?.unit)}
                      </Typography>
                    </Layouts.Margin>
                  </Layouts.Margin>
                </Layouts.Box>

                <Layouts.Flex justifyContent="flex-end">
                  <Layouts.Margin right="2">
                    <Layouts.Box width="75px">
                      {index === 0 ? (
                        <Layouts.Margin right="2">
                          <Typography
                            color="secondary"
                            textAlign="left"
                            shade="desaturated"
                            variant="bodyMedium"
                          >
                            {t(`Text.Price`)}
                          </Typography>
                        </Layouts.Margin>
                      ) : null}
                      <Layouts.Margin top="1" right="2">
                        {values.unlockOverrides ? (
                          <FormInput
                            onChange={handleChange}
                            name={`lineItems[${index}].price`}
                            value={lineItem.price}
                            type="number"
                            error={getIn(errors, `lineItems[${index}].price`)}
                          />
                        ) : (
                          <Layouts.Margin bottom="2">
                            <Typography>{formatCurrency(lineItem.price)}</Typography>
                          </Layouts.Margin>
                        )}
                      </Layouts.Margin>
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
                          {t(`Text.QTY`)}
                        </Typography>
                      ) : null}
                      {values.unlockOverrides ? (
                        <Layouts.Margin top="1">
                          <FormInput
                            name={`lineItems[${index}].quantity`}
                            key={`lineItems[${index}].quantity`}
                            value={lineItem.quantity}
                            type="number"
                            limits={{
                              min: 1,
                            }}
                            countable
                            onChange={handleChange}
                          />
                        </Layouts.Margin>
                      ) : (
                        <Layouts.Margin top="1">
                          <Typography>{lineItem.quantity}</Typography>
                        </Layouts.Margin>
                      )}
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
                          {t(`Text.Total`)}
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
            ));
          }}
        </FieldArray>
      ) : null}

      <Layouts.Margin top="2">
        <FieldArray name="newLineItems">
          {({ push, remove }) => (
            <>
              {values.newLineItems
                ? values.newLineItems.map((lineItem, index) => (
                    <Layouts.Flex justifyContent="space-between" key={index}>
                      <Layouts.Box width="424px" as={Layouts.Flex} justifyContent="space-between">
                        <Layouts.Flex direction="column">
                          <Layouts.Flex alignItems="center">
                            <Layouts.Margin bottom="4">
                              <Layouts.IconLayout remove>
                                <DeleteIcon onClick={() => remove(index)} />
                              </Layouts.IconLayout>
                            </Layouts.Margin>

                            <Layouts.Margin right="3">
                              <Layouts.Box width="140px">
                                <Select
                                  placeholder="Select line Item"
                                  name={`newLineItems[${index}].billableLineItemId`}
                                  value={lineItem.billableLineItemId}
                                  options={lineItemOptions}
                                  error={getIn(errors, `newLineItems[${index}].billableLineItemId`)}
                                  onSelectChange={(name: string, value: number) => {
                                    handleLineItemChange(value, index);
                                  }}
                                  nonClearable
                                />
                              </Layouts.Box>
                            </Layouts.Margin>
                            <Layouts.Margin>
                              <Layouts.Box width="140px">
                                <Select
                                  placeholder={t(`${I18N_PATH}SelectMaterial`)}
                                  name={`newLineItems[${index}].materialId`}
                                  ariaLabel="Material"
                                  value={lineItem.materialId ?? undefined}
                                  options={materialOptions}
                                  error={getIn(errors, `newLineItems[${index}].materialId`)}
                                  onSelectChange={(name: string, value: number) => {
                                    setFieldValue(name, value);
                                    handleLineItemMaterialChange(value, index);
                                  }}
                                />
                              </Layouts.Box>
                            </Layouts.Margin>
                          </Layouts.Flex>
                        </Layouts.Flex>
                        <Layouts.Margin>
                          <Layouts.Margin top="1">
                            <Layouts.Box width="75px">
                              <Typography variant="bodyMedium" textAlign="right">
                                {startCase(lineItem.historicalLineItem?.unit)}
                              </Typography>
                            </Layouts.Box>
                          </Layouts.Margin>
                        </Layouts.Margin>
                      </Layouts.Box>

                      <Layouts.Flex justifyContent="flex-end" alignItems="baseline">
                        <Layouts.Margin right="2">
                          <Layouts.Box width="75px">
                            <Layouts.Margin top="1" right="2">
                              {values.unlockOverrides ? (
                                <FormInput
                                  onChange={handleChange}
                                  name={`newLineItems[${index}].price`}
                                  value={lineItem.price}
                                  type="number"
                                  error={getIn(errors, `newLineItems[${index}].price`)}
                                />
                              ) : (
                                <Typography>{formatCurrency(lineItem.price)}</Typography>
                              )}
                            </Layouts.Margin>
                          </Layouts.Box>
                        </Layouts.Margin>
                        <Layouts.Margin right="1">
                          <Layouts.Box width="75px">
                            <FormInput
                              name={`newLineItems[${index}].quantity`}
                              key={`newLineItems[${index}].quantity`}
                              value={lineItem.quantity}
                              type="number"
                              limits={{
                                min: 1,
                              }}
                              countable
                              error={getIn(errors, `newLineItems[${index}].quantity`)}
                              onChange={handleChange}
                            />
                          </Layouts.Box>
                        </Layouts.Margin>
                        <Layouts.Box minWidth="75px">
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
                  ))
                : null}

              <Button
                variant="none"
                onClick={() => {
                  push({
                    billableLineItemId: +lineItemStore.sortedValues[0]?.id,
                    quantity: 1,
                    units: undefined,
                    customRatesGroupLineItemsId: null,
                    globalRatesLineItemsId: undefined,
                    price: undefined,
                    materialId: null,
                    historicalLineItem: {
                      description: '',
                      oneTime: true,
                      unit: undefined,
                    },
                  });
                  handleLineItemChange(
                    +lineItemStore.sortedValues[0]?.id,
                    values.newLineItems?.length ?? 0,
                  );
                }}
              >
                <Typography variant="bodyMedium" cursor="pointer" color="information">
                  + {t(`${I18N_PATH}AddLineItem`)}
                </Typography>
              </Button>
            </>
          )}
        </FieldArray>
      </Layouts.Margin>
    </>
  );
};

export default observer(LineItems);
