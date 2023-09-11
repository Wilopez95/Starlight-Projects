/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { noop, startCase } from 'lodash-es';

import { IOrderRatesCalculateResponse } from '@root/api';
import { PlusIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { getUnitLabel, handleEnterOrSpaceKeyDown, materialToSelectOption } from '@root/helpers';
import { useStores, useUserContext } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableOrder, JsonConversions } from '@root/types';

import { BillableLineItemUnitTypeEnum } from '@root/consts';
import { DeleteButton } from '../../../components/OrderQuickViewSections/DeleteButton/DeleteButton';
import { getDefaultLineItem } from '../../../helpers/orderItemsData';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.Services.Text.';

interface ILineItemsSection {
  onRateRequest(
    lineItem?: { lineItemId: number; materialId?: number | null },
    materialId?: number,
  ): Promise<JsonConversions<IOrderRatesCalculateResponse> | null>;
}

export const LineItemsSection: React.FC<ILineItemsSection> = ({ onRateRequest }) => {
  const { lineItemStore, materialStore } = useStores();
  const { t } = useTranslation();
  const { currencySymbol, formatCurrency } = useIntl();
  const { values, errors, setValues, setFieldValue, handleChange } =
    useFormikContext<IConfigurableOrder>();

  const { currentUser } = useUserContext();

  const getLineItemUnitLabel = useCallback(
    units =>
      startCase(getUnitLabel(units as BillableLineItemUnitTypeEnum, currentUser?.company?.unit)),
    [currentUser?.company?.unit],
  );

  const handleChangeBillableLineItem = useCallback(
    async (path: string, lineItemId: number) => {
      const basePath = path.substring(0, path.indexOf('.billableLineItemId'));

      const existingLineItem = values.lineItems?.find(
        ({ billableLineItemId }) => billableLineItemId === lineItemId,
      )?.billableLineItem;

      const billableLineItem = existingLineItem ?? lineItemStore.getById(lineItemId);

      if (!billableLineItem) {
        return;
      }

      setFieldValue(path, lineItemId);
      setFieldValue(`${basePath}.billableLineItem`, {
        id: billableLineItem.id,
        originalId: existingLineItem ? existingLineItem.originalId : billableLineItem.id,
        active: billableLineItem.active,
        oneTime: billableLineItem.oneTime,
        description: billableLineItem.description,
        createdAt: billableLineItem.createdAt,
        updatedAt: billableLineItem.updatedAt,
        applySurcharges: billableLineItem.applySurcharges,
        businessLineId: billableLineItem.businessLineId,
        unit: billableLineItem.unit,
      });
      setFieldValue(`${basePath}.materialId`, undefined);
      setFieldValue(`${basePath}.units`, billableLineItem?.unit);

      const result = await onRateRequest({
        lineItemId,
        materialId: billableLineItem?.materialBasedPricing ? values.materialId : undefined,
      });

      const global = result?.globalRates?.globalRatesLineItems?.[0];
      const custom = result?.customRates?.customRatesLineItems?.[0];
      const price = custom?.price ?? global?.price ?? 0;

      setFieldValue('globalRatesSurcharges', result?.globalRates?.globalRatesSurcharges);
      setFieldValue('customRatesSurcharges', result?.customRates?.customRatesSurcharges);

      setFieldValue(`${basePath}.price`, price);
      setFieldValue(`${basePath}.globalRatesLineItemsId`, global?.id);
      setFieldValue(`${basePath}.customRatesGroupLineItemsId`, custom?.id);
    },
    [lineItemStore, onRateRequest, setFieldValue, values.lineItems, values.materialId],
  );

  const handleChangeLineItemMaterial = useCallback(
    async (path: string, materialId: number, lineItemIndex: number) => {
      const basePath = path.substring(0, path.indexOf('.materialId'));

      const lineItem = values.lineItems?.[lineItemIndex];

      if (lineItem) {
        setFieldValue(path, materialId);
        setFieldValue(`${basePath}.material`, { id: materialId });
        const billableLineItem = lineItemStore.getById(lineItem?.billableLineItemId);

        const result = await onRateRequest({
          lineItemId: lineItem.billableLineItemId,
          materialId: billableLineItem?.materialBasedPricing ? materialId : undefined,
        });

        const global = result?.globalRates?.globalRatesLineItems?.[0];
        const custom = result?.customRates?.customRatesLineItems?.[0];

        const price = custom?.price ?? global?.price ?? 0;

        setFieldValue('globalRatesSurcharges', result?.globalRates?.globalRatesSurcharges);
        setFieldValue('customRatesSurcharges', result?.customRates?.customRatesSurcharges);

        const { globalRatesLineItemsId, customRatesGroupLineItemsId } = ratesLineItems(
          result as IOrderRatesCalculateResponse,
        );

        setFieldValue(`${basePath}.price`, price);
        setFieldValue(`${basePath}.globalRatesLineItemsId`, globalRatesLineItemsId);
        setFieldValue(`${basePath}.customRatesGroupLineItemsId`, customRatesGroupLineItemsId);
      } else {
        setFieldValue(`${basePath}.material`, { id: materialId });
      }
    },
    [lineItemStore, onRateRequest, setFieldValue, values.lineItems],
  );

  const handleAddLineItem = useCallback(async () => {
    const defaultId = lineItemStore.sortedValues[0].id;
    const billableLineItem = lineItemStore.getById(defaultId);

    if (!billableLineItem) {
      return;
    }

    setValues(prev => ({
      ...prev,
      lineItems: [...(prev.lineItems ?? []), getDefaultLineItem(billableLineItem)],
    }));

    const result = await onRateRequest({
      lineItemId: defaultId,
      materialId: billableLineItem?.materialBasedPricing ? values.materialId : undefined,
    });

    const price = result?.customRates?.customRatesService
      ? result.customRates?.customRatesLineItems?.[0].price
      : result?.globalRates?.globalRatesLineItems?.[0].price;

    setValues(prev => {
      const updatedLineItems = [...(prev.lineItems ?? [])];
      const lastIndex = updatedLineItems.length - 1;

      const currentLineItem = updatedLineItems[lastIndex];

      const { globalRatesLineItemsId, customRatesGroupLineItemsId } = ratesLineItems(
        result as IOrderRatesCalculateResponse,
      );

      updatedLineItems[lastIndex] = {
        ...currentLineItem,
        globalRatesLineItemsId,
        customRatesGroupLineItemsId,
        price,
      };

      return {
        ...prev,
        lineItems: updatedLineItems,
      };
    });
  }, [lineItemStore, onRateRequest, setValues, values.materialId]);

  const ratesLineItems = (result?: IOrderRatesCalculateResponse) => {
    let globalRatesLineItemsId: number | null = null;
    let customRatesGroupLineItemsId: number | null = null;
    if (result?.customRates?.customRatesService) {
      customRatesGroupLineItemsId = result?.customRates?.customRatesLineItems?.[0].id ?? null;
    } else {
      globalRatesLineItemsId = result?.globalRates?.globalRatesLineItems?.[0].id ?? null;
    }
    return { globalRatesLineItemsId, customRatesGroupLineItemsId };
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleAddLineItem();
      }
    },
    [handleAddLineItem],
  );

  const lineItemOptions: ISelectOption[] = useMemo(
    () =>
      lineItemStore.sortedValues.map(lineItem => ({
        label: lineItem.description,
        value: lineItem.id,
      })),
    [lineItemStore.sortedValues],
  );

  const materialOptions: ISelectOption[] = useMemo(
    () => materialStore.values.map(materialToSelectOption),
    [materialStore.values],
  );
  const isOverrideAllowed = values.unlockOverrides;

  return (
    <>
      {values.lineItems?.length ? (
        <Layouts.Grid columns="auto 130px 130px" columnGap="2">
          <Layouts.Cell width={7}>
            <Typography variant="headerFour">{t(`${I18N_PATH}LineItems`)}</Typography>
          </Layouts.Cell>

          <FieldArray name="lineItems">
            {({ remove }) =>
              values.lineItems?.map((lineItem, index) => {
                return (
                  <React.Fragment key={index}>
                    <DeleteButton
                      onClick={() => remove(index)}
                      disabled={!values.unlockOverrides}
                    />

                    <Layouts.Cell width={3}>
                      <Select
                        label={t(`${I18N_PATH}Item`)}
                        placeholder="Select line Item"
                        ariaLabel="Line item"
                        name={`lineItems[${index}].billableLineItemId`}
                        value={lineItem.billableLineItem?.id}
                        options={lineItemOptions}
                        error={getIn(errors, `lineItems[${index}].billableLineItemId`)}
                        onSelectChange={handleChangeBillableLineItem}
                        nonClearable
                        disabled={!isOverrideAllowed}
                      />
                    </Layouts.Cell>

                    <FormInput
                      label={t(`${I18N_PATH}QTY`)}
                      onChange={handleChange}
                      name={`lineItems[${index}].quantity`}
                      ariaLabel="Quantity"
                      value={lineItem.quantity}
                      error={getIn(errors, `lineItems[${index}].quantity`)}
                      type="number"
                      disabled={!values.unlockOverrides}
                      limits={{
                        min: 1,
                      }}
                      countable
                    />

                    <FormInput
                      label={t(`${I18N_PATH}Price`)}
                      type="number"
                      onChange={handleChange}
                      name={`lineItems[${index}].price`}
                      ariaLabel="Price"
                      value={lineItem.price}
                      error={getIn(errors, `lineItems[${index}].price`)}
                      disabled={!values.unlockOverrides}
                    />

                    <FormInput
                      label={t(`${I18N_PATH}Total`, { currencySymbol })}
                      name={`lineItems[${index}].price`}
                      ariaLabel="Total"
                      value={formatCurrency(+(lineItem.price ?? 0) * lineItem.quantity)}
                      onChange={handleChange}
                      disabled
                    />

                    <Layouts.Cell width={3} left={2}>
                      <Select
                        label={t(`${I18N_PATH}Material`)}
                        placeholder="Select Material"
                        ariaLabel="Material"
                        name={`lineItems[${index}].materialId`}
                        value={lineItem.material?.originalId ?? lineItem.material?.id}
                        options={materialOptions}
                        error={getIn(errors, `lineItems[${index}].materialId`)}
                        onSelectChange={
                          isOverrideAllowed
                            ? (name, value: number) =>
                                handleChangeLineItemMaterial(name, value, index)
                            : noop
                        }
                        disabled={!isOverrideAllowed}
                      />
                    </Layouts.Cell>

                    <FormInput
                      label={t(`${I18N_PATH}ManifestNumber`)}
                      name={`lineItems[${index}].manifestNumber`}
                      ariaLabel="Manifest Number"
                      value={lineItem.manifestNumber ?? undefined}
                      onChange={handleChange}
                      disabled={!isOverrideAllowed}
                    />

                    <Layouts.Cell width={2}>
                      <FormInput
                        label={t(`${I18N_PATH}Unit`)}
                        name={`lineItems[${index}].units`}
                        ariaLabel="Unit"
                        value={getLineItemUnitLabel(lineItem.billableLineItem?.unit)}
                        onChange={handleChange}
                        disabled
                      />
                    </Layouts.Cell>
                    <Layouts.Cell width={7}>
                      <Divider bottom />
                    </Layouts.Cell>
                  </React.Fragment>
                );
              })
            }
          </FieldArray>
        </Layouts.Grid>
      ) : null}

      <Layouts.Flex justifyContent="center" alignItems="flex-end" direction="column">
        <Typography
          tabIndex={0}
          color={isOverrideAllowed ? 'information' : 'grey'}
          role="button"
          textAlign="center"
          onClick={isOverrideAllowed ? handleAddLineItem : noop}
          onKeyDown={isOverrideAllowed ? handleKeyDown : noop}
        >
          <Layouts.Flex alignItems="center" justifyContent="flex-end">
            <Layouts.IconLayout disableFill>
              <PlusIcon />
            </Layouts.IconLayout>
            {t(`${I18N_PATH}AddBillableItem`)}
          </Layouts.Flex>
        </Typography>
        {values.noBillableService && !values.lineItems?.length ? (
          <Typography color="alert" variant="bodySmall">
            {getIn(errors, 'lineItems')}
          </Typography>
        ) : null}
      </Layouts.Flex>
    </>
  );
};
