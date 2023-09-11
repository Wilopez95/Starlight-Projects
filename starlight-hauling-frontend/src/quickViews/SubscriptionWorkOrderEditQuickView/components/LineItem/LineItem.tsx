import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import ConfirmModal from '@root/components/modals/Confirm/Confirm';
import { useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { useCalcLineItemRate } from '@root/quickViews/SubscriptionOrderEdit/components/LineItem/hooks';
import LineItemSelect from '@root/quickViews/SubscriptionOrderEdit/components/LineItemSelect/LineItemSelect';
import MaterialSelect from '@root/quickViews/SubscriptionOrderEdit/components/MaterialSelect/MaterialSelect';
import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

import { ILineItemComponent } from '../LineItems/types';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.LineItems.';

const LineItem: React.FC<ILineItemComponent> = ({ index = 0, lineItem, handleRemove }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useIntl();

  const { values, errors, handleChange, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionWorkOrder>();
  const { subscriptionOrderStore } = useStores();

  const [isIdenticalItemsModalOpen, toggleIdenticalItemsModal] = useToggle();
  const [parentItemId, setParentItemId] = useState<number | undefined>(undefined);

  const { calcLineItemRates } = useCalcLineItemRate();

  const handleCalculatePrice = useCallback(
    async (lineItemId: number, materialId?: number | null) => {
      const { price, customRatesGroupLineItemsId, globalRatesLineItemsId } =
        await calcLineItemRates({
          lineItemId,
          materialId,
          serviceMaterialId: values.subscriptionServiceItem?.materialId,
          customRatesGroupId: values.customRatesGroupId,
          businessLineId: values.businessLineId,
        });

      setFieldValue(`lineItems[${index}].globalRatesLineItemsId`, globalRatesLineItemsId);
      setFieldValue(`lineItems[${index}].customRatesGroupLineItemsId`, customRatesGroupLineItemsId);
      setFieldValue(`lineItems[${index}].price`, price ?? 0);
    },
    [setFieldValue, calcLineItemRates, values, index],
  );

  const handleLineItemChange = useCallback(
    async (id: number, value: number) => {
      const isParentLineItem = subscriptionOrderStore.selectedEntity?.lineItems?.find(
        item => item.historicalLineItem?.originalId === id,
      );

      if (isParentLineItem) {
        setParentItemId(id);
        toggleIdenticalItemsModal();
      } else {
        setFieldValue(`lineItems[${value}].historicalLineItem.originalId`, id);
        setFieldValue(`lineItems[${value}].billableLineItemId`, id);

        await handleCalculatePrice(id, lineItem.materialId);
      }
    },
    [
      setFieldValue,
      handleCalculatePrice,
      lineItem.materialId,
      subscriptionOrderStore.selectedEntity?.lineItems,
      setParentItemId,
      toggleIdenticalItemsModal,
    ],
  );

  const handleMaterialChange = useCallback(
    async (id: number, value: number) => {
      setFieldValue(`lineItems[${value}].materialId`, id);

      await handleCalculatePrice(
        lineItem.historicalLineItem?.originalId ?? lineItem.billableLineItemId,
        id || values.subscriptionServiceItem?.materialId,
      );
    },
    [
      setFieldValue,
      handleCalculatePrice,
      values,
      lineItem.billableLineItemId,
      lineItem.historicalLineItem?.originalId,
    ],
  );

  const handleConfirm = useCallback(async () => {
    setFieldValue(`lineItems[${index}].historicalLineItem.originalId`, parentItemId);
    setFieldValue(`lineItems[${index}].billableLineItemId`, parentItemId);

    parentItemId && (await handleCalculatePrice(parentItemId, lineItem.materialId));
    toggleIdenticalItemsModal();
  }, [
    index,
    setFieldValue,
    handleCalculatePrice,
    parentItemId,
    lineItem.materialId,
    toggleIdenticalItemsModal,
  ]);

  return (
    <Layouts.Flex justifyContent="space-between" key={index}>
      <ConfirmModal
        isOpen={isIdenticalItemsModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t('Text.Confirm')}
        title={t(`${I18N_PATH}IdenticalLineItems`)}
        subTitle={t(`${I18N_PATH}IdenticalLineItemsSubTitle`)}
        onCancel={toggleIdenticalItemsModal}
        onSubmit={handleConfirm}
        nonDestructive
      />
      <Layouts.Box width="424px" as={Layouts.Flex} justifyContent="space-between">
        <Layouts.Flex direction="column">
          {index === 0 ? (
            <Layouts.Margin left="0">
              <Layouts.Padding left="0.5">
                <Typography
                  as="label"
                  shade="desaturated"
                  color="secondary"
                  variant="bodyMedium"
                  htmlFor={`lineItems[${index}].billableLineItemId`}
                >
                  {t(`${I18N_PATH}LineItem`)}
                </Typography>
              </Layouts.Padding>
            </Layouts.Margin>
          ) : null}
          <Layouts.Flex alignItems="center">
            <Layouts.Margin bottom="4">
              <Layouts.IconLayout remove>
                <DeleteIcon onClick={handleRemove} />
              </Layouts.IconLayout>
            </Layouts.Margin>
            <Layouts.Margin right="3">
              <Layouts.Box width="180px">
                <LineItemSelect
                  placeholder={t(`${I18N_PATH}SelectLineItem`)}
                  name={`lineItems[${index}].billableLineItemId`}
                  value={lineItem.historicalLineItem?.originalId ?? lineItem.billableLineItemId}
                  error={getIn(errors, `lineItems[${index}].billableLineItemId`)}
                  onSelectChange={(name: string, value: number) => {
                    handleLineItemChange(value, index);
                  }}
                  nonClearable
                />
              </Layouts.Box>
            </Layouts.Margin>
            <Layouts.Margin>
              <Layouts.Box width="180px">
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
          <Layouts.Box width="75px">
            {index === 0 ? (
              <Layouts.Margin right="2">
                <Typography
                  color="secondary"
                  textAlign="right"
                  shade="desaturated"
                  variant="bodyMedium"
                  htmlFor={`lineItems[${index}].price`}
                >
                  {t(`${I18N_PATH}Price`)}
                </Typography>
              </Layouts.Margin>
            ) : null}
            <Layouts.Margin top="1" right="2">
              <Typography variant="bodyMedium" textAlign="right">
                {formatCurrency(lineItem.price)}
              </Typography>
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
