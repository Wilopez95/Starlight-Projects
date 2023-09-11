import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { Protected, Section, Subsection, Switch, Typography } from '@root/common';
import { ClientRequestType } from '@root/consts';
import {
  calcNewOrderSurcharges,
  calcTaxesForOrderService,
  handleEnterOrSpaceKeyDown,
} from '@root/helpers';
import { useBusinessContext, usePermission, useStores, useToggle, useBoolean } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerGroupType } from '@root/types';

import SurchargesCalculationModal from '@root/components/modals/SurchargesCalculation/SurchargesCalculationModal';
import MultiTaxesCalculationModal from '@root/components/modals/MultiTaxesCalculation/MultiTaxesCalculationModal';
import { getOrderLineItemsTotal, getOrderServiceTotal } from '../../helpers';
import { INewRecurrentOrder } from '../../types';
import { INewOrderFormData } from '../../../Order/types';

const taxRateOptions = [
  { label: 'Commercial', value: CustomerGroupType.commercial },
  { label: 'Non-Commercial', value: CustomerGroupType.nonCommercial },
];

const SummarySection: React.FC = () => {
  const { values, errors, setFieldValue } = useFormikContext<INewRecurrentOrder>();
  const { businessUnitId } = useBusinessContext();
  const [isPromoSearchShown, togglePromoSearchShown] = useToggle();
  const { promoStore, surchargeStore, i18nStore } = useStores();
  const [isSurchargesModalOpen, openSurchargesModal, closeSurchargesModal] = useBoolean();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const canChangeTaxRate = usePermission('orders:change-tax-rate:perform');

  useLayoutEffect(() => {
    setFieldValue('recurrentTemplateData.promoApplied', isPromoSearchShown);
  }, [isPromoSearchShown, setFieldValue]);

  useEffect(() => {
    promoStore.cleanup();
    promoStore.request({
      businessLineId: values.businessLineId,
      businessUnitId,
      activeOnly: true,
      excludeExpired: true,
    });
  }, [promoStore, businessUnitId, values.businessLineId]);

  const [servicesTotal, lineItemsTotal] = useMemo(() => {
    let service = getOrderServiceTotal(values.recurrentTemplateData);

    if (values.delivery) {
      service += getOrderServiceTotal(values.delivery);
    }
    if (values.final) {
      service += getOrderServiceTotal(values.final);
    }

    let lineItems = getOrderLineItemsTotal(values.recurrentTemplateData);

    if (values.delivery) {
      lineItems += getOrderLineItemsTotal(values.delivery);
    }
    if (values.final) {
      lineItems += getOrderLineItemsTotal(values.final);
    }

    return [service, lineItems];
  }, [values.delivery, values.final, values.recurrentTemplateData]);

  const surchargesTotal = useMemo(() => {
    if (!values.applySurcharges) {
      return 0;
    }

    let orderSurchargesTotal;

    ({ orderSurchargesTotal } = calcNewOrderSurcharges({
      newOrder: values.recurrentTemplateData,
      surcharges: surchargeStore.values,
    }));

    orderSurchargesTotal =
      orderSurchargesTotal * (values.recurrentTemplateData.billableServiceQuantity ?? 1);

    if (values.delivery) {
      orderSurchargesTotal +=
        calcNewOrderSurcharges({
          newOrder: values.delivery,
          surcharges: surchargeStore.values,
        }).orderSurchargesTotal * (values.delivery.billableServiceQuantity ?? 1);
    }
    if (values.final) {
      orderSurchargesTotal +=
        calcNewOrderSurcharges({
          newOrder: values.final,
          surcharges: surchargeStore.values,
        }).orderSurchargesTotal * (values.final.billableServiceQuantity ?? 1);
    }

    return orderSurchargesTotal;
  }, [
    surchargeStore.values,
    values.applySurcharges,
    values.delivery,
    values.final,
    values.recurrentTemplateData,
  ]);

  const beforeTaxesTotal = lineItemsTotal + servicesTotal;

  const taxesTotal = useMemo(() => {
    if (!values.taxDistricts) {
      return 0;
    }
    let lineItemsWithSurcharges = values.recurrentTemplateData.lineItems;
    let serviceTotalWithSurcharges = Number(values.recurrentTemplateData.billableServicePrice) || 0;

    if (values.applySurcharges) {
      ({ lineItemsWithSurcharges, serviceTotalWithSurcharges } = calcNewOrderSurcharges({
        newOrder: values.recurrentTemplateData,
        surcharges: surchargeStore.values,
      }));
    }

    let taxes =
      calcTaxesForOrderService(values.recurrentTemplateData, {
        region: i18nStore.region,
        serviceTotal: serviceTotalWithSurcharges,
        lineItems: lineItemsWithSurcharges,
        thresholds: [],
        taxDistricts: values.taxDistricts,
        businessLineId: values.businessLineId,
        commercialTaxesUsed: values.commercialTaxesUsed,
      }) * (values.recurrentTemplateData.billableServiceQuantity ?? 1);

    if (values.delivery) {
      let lineItemsWithSurchargesData = values.delivery.lineItems;
      let serviceTotalWithSurchargesData = Number(values.delivery.billableServicePrice) || 0;

      if (values.applySurcharges) {
        ({ lineItemsWithSurcharges, serviceTotalWithSurcharges } = calcNewOrderSurcharges({
          newOrder: values.delivery,
          surcharges: surchargeStore.values,
        }));
        serviceTotalWithSurchargesData = serviceTotalWithSurcharges;
        lineItemsWithSurchargesData = lineItemsWithSurcharges;
      }
      taxes +=
        calcTaxesForOrderService(values.delivery, {
          region: i18nStore.region,
          serviceTotal: serviceTotalWithSurchargesData,
          lineItems: lineItemsWithSurchargesData,
          thresholds: [],
          taxDistricts: values.taxDistricts,
          businessLineId: values.businessLineId,
          commercialTaxesUsed: values.commercialTaxesUsed,
        }) * (values.delivery.billableServiceQuantity ?? 1);
    }

    if (values.final) {
      let lineItemsWithSurchargesData = values.final.lineItems;
      let serviceTotalWithSurchargesData = Number(values.final.billableServicePrice) || 0;

      if (values.applySurcharges) {
        ({ lineItemsWithSurcharges, serviceTotalWithSurcharges } = calcNewOrderSurcharges({
          newOrder: values.final,
          surcharges: surchargeStore.values,
        }));
        serviceTotalWithSurchargesData = serviceTotalWithSurcharges;
        lineItemsWithSurchargesData = lineItemsWithSurcharges;
      }
      taxes +=
        calcTaxesForOrderService(values.final, {
          region: i18nStore.region,
          serviceTotal: serviceTotalWithSurchargesData,
          lineItems: lineItemsWithSurchargesData,
          thresholds: [],
          taxDistricts: values.taxDistricts,
          businessLineId: values.businessLineId,
          commercialTaxesUsed: values.commercialTaxesUsed,
        }) * (values.final.billableServiceQuantity ?? 1);
    }

    return taxes;
  }, [
    values.taxDistricts,
    values.recurrentTemplateData,
    values.applySurcharges,
    values.businessLineId,
    values.commercialTaxesUsed,
    values.delivery,
    values.final,
    i18nStore.region,
    surchargeStore.values,
  ]);

  const promoOptions: ISelectOption[] = useMemo(
    () =>
      promoStore.sortedValues.map(promo => ({
        label: promo.name,
        value: promo.id,
        hint: promo.note ?? '',
      })),
    [promoStore.sortedValues],
  );

  const handleChangeUnlockOverrides = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      setFieldValue(name, checked);
    },
    [setFieldValue],
  );

  const handleTaxRateChange = useCallback(
    (_, value: CustomerGroupType) => {
      setFieldValue('commercialTaxesUsed', value === CustomerGroupType.commercial);
    },
    [setFieldValue],
  );

  const handleChangeApplySurcharges = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      setFieldValue(name, checked);

      setFieldValue('recurrentTemplateData.applySurcharges', checked);
      if (values.final) {
        setFieldValue('final.applySurcharges', checked);
      }
      if (values.delivery) {
        setFieldValue('delivery.applySurcharges', checked);
      }
    },
    [setFieldValue, values.delivery, values.final],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        togglePromoSearchShown();
      }
    },
    [togglePromoSearchShown],
  );

  const hasSurcharges = surchargesTotal > 0;

  const orderTotals = beforeTaxesTotal + surchargesTotal + taxesTotal;
  const recurrentOrder: INewOrderFormData[] = [];

  if (values.delivery) {
    recurrentOrder.push(values.delivery);
  }
  if (values.final) {
    recurrentOrder.push(values.final);
  }

  return (
    <Section>
      {surchargesTotal > 0 ? (
        <SurchargesCalculationModal
          isOpen={isSurchargesModalOpen}
          onClose={closeSurchargesModal}
          orders={recurrentOrder}
          RecurrentOrder={values.recurrentTemplateData}
        />
      ) : null}
      {taxesTotal > 0 ? (
        <MultiTaxesCalculationModal
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          commercialTaxesUsed={values.commercialTaxesUsed}
        />
      ) : null}
      <Subsection>
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Margin bottom="1">
              <Typography variant="headerThree">
                {values.type === ClientRequestType.NonServiceOrder ? 'Non-Service Order ' : null}
                Summary
              </Typography>
            </Layouts.Margin>
            {isPromoSearchShown ? (
              <Layouts.Flex alignItems="center">
                <Layouts.IconLayout remove>
                  <DeleteIcon
                    role="button"
                    aria-label={t('Text.Remove')}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    onClick={togglePromoSearchShown}
                  />
                </Layouts.IconLayout>
                <Layouts.Box width="90%">
                  <Select
                    placeholder="Select promo"
                    label="Promotion*"
                    name="recurrentTemplateData.promoId"
                    options={promoOptions}
                    value={values.recurrentTemplateData.promoId ?? ''}
                    onSelectChange={setFieldValue}
                    error={errors.recurrentTemplateData?.promoId}
                    searchable
                    exactSearch
                  />
                </Layouts.Box>
              </Layouts.Flex>
            ) : (
              <Layouts.Margin top="3">
                <Typography
                  variant="bodyMedium"
                  color="information"
                  cursor="pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  onClick={togglePromoSearchShown}
                >
                  + Add Promo Code
                </Typography>
              </Layouts.Margin>
            )}
            <Layouts.Margin top="3">
              <Checkbox
                name="applySurcharges"
                value={values.applySurcharges}
                onChange={handleChangeApplySurcharges}
                tabIndex={0}
              >
                Apply Surcharges
              </Checkbox>
            </Layouts.Margin>
            {(values.taxDistricts?.filter(district => district.taxesPerCustomerType) ?? []).length >
            0 ? (
              <Layouts.Margin top="2">
                <Select
                  label="Tax Rate"
                  name="commercialTaxesUsed"
                  options={taxRateOptions}
                  disabled={!canChangeTaxRate}
                  value={
                    values.commercialTaxesUsed
                      ? CustomerGroupType.commercial
                      : CustomerGroupType.nonCommercial
                  }
                  onSelectChange={handleTaxRateChange}
                  error={errors.commercialTaxesUsed}
                />
              </Layouts.Margin>
            ) : null}
          </Layouts.Column>
          <Layouts.Column>
            <Protected permissions="orders:unlock-overrides:perform">
              <Layouts.Flex direction="column" alignItems="flex-end">
                <Switch
                  name="recurrentTemplateData.unlockOverrides"
                  value={values.recurrentTemplateData.unlockOverrides}
                  onChange={handleChangeUnlockOverrides}
                >
                  Unlock Overrides
                </Switch>
              </Layouts.Flex>
            </Protected>
            <Layouts.Box width="80%" float="right">
              <Layouts.Flex direction="column" alignItems="flex-end">
                {values.type !== ClientRequestType.NonServiceOrder ? (
                  <Layouts.Padding top="1" bottom="1">
                    <Typography
                      variant="bodyMedium"
                      color="secondary"
                      shade="desaturated"
                      textAlign="right"
                    >
                      <Layouts.Flex>
                        <Layouts.Margin right="4">
                          <Layouts.Box width="100px">Service(s):</Layouts.Box>
                        </Layouts.Margin>
                        <Layouts.Box width="100px">{formatCurrency(servicesTotal)}</Layouts.Box>
                      </Layouts.Flex>
                    </Typography>
                  </Layouts.Padding>
                ) : null}

                <Layouts.Padding top="1" bottom="1">
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    shade="desaturated"
                    textAlign="right"
                  >
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="200px">Line Item(s):</Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">{formatCurrency(lineItemsTotal)}</Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>

                <Layouts.Padding top="1" bottom="1">
                  <Typography variant="bodyMedium" textAlign="right">
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="100px">Total:</Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">{formatCurrency(beforeTaxesTotal)}</Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>
                {values.applySurcharges ? (
                  <Layouts.Padding top="1" bottom="1">
                    <Typography variant="bodyMedium" textAlign="right">
                      <Layouts.Flex>
                        <Layouts.Margin right="4">
                          <Layouts.Box width="100px">Surcharges:</Layouts.Box>
                        </Layouts.Margin>
                        <Layouts.Box width="100px">
                          <Typography
                            onClick={hasSurcharges ? openSurchargesModal : undefined}
                            variant="bodyMedium"
                            textAlign="right"
                            cursor={hasSurcharges ? 'pointer' : undefined}
                            textDecoration={hasSurcharges ? 'underline' : undefined}
                          >
                            {formatCurrency(surchargesTotal)}
                          </Typography>
                        </Layouts.Box>
                      </Layouts.Flex>
                    </Typography>
                  </Layouts.Padding>
                ) : null}
                <Layouts.Padding top="1" bottom="1">
                  <Typography variant="bodyMedium" textAlign="right">
                    <Layouts.Flex>
                      <Layouts.Margin right="4">
                        <Layouts.Box width="100px">Taxes:</Layouts.Box>
                      </Layouts.Margin>
                      <Layouts.Box width="100px">
                        <Typography
                          onClick={taxesTotal > 0 ? openTaxesModal : undefined}
                          variant="bodyMedium"
                          textAlign="right"
                          cursor={taxesTotal > 0 ? 'pointer' : undefined}
                          textDecoration={taxesTotal > 0 ? 'underline' : undefined}
                          tabIndex={0}
                        >
                          {formatCurrency(taxesTotal)}
                        </Typography>
                      </Layouts.Box>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Padding>
              </Layouts.Flex>
            </Layouts.Box>
          </Layouts.Column>
        </Layouts.Flex>
      </Subsection>
      <Subsection gray>
        <Typography variant="bodyMedium" textAlign="right" fontWeight="semiBold">
          <Layouts.Flex justifyContent="flex-end">
            <Layouts.Margin right="4">
              <Layouts.Box width="200px">Grand Total:</Layouts.Box>
            </Layouts.Margin>
            <Layouts.Box width="100px">{formatCurrency(orderTotals)}</Layouts.Box>
          </Layouts.Flex>
        </Typography>
      </Subsection>
    </Section>
  );
};

export default observer(SummarySection);
