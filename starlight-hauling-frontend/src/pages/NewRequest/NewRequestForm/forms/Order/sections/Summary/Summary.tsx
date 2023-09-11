import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { BillingIcon, DeleteIcon } from '@root/assets';
import { Protected, Section, Subsection, Switch, Typography } from '@root/common';
import {
  AppliedTaxesModal,
  MultiTaxesCalculationModal,
  SurchargesCalculationModal,
} from '@root/components/modals';
import { ClientRequestType, CustomerStatus } from '@root/consts';
import {
  calcNewOrderSurcharges,
  calcTaxesForOrderService,
  handleEnterOrSpaceKeyDown,
} from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useLinkSubscriptionOrderFormPrices,
  usePermission,
  useStores,
  useToggle,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerGroupType } from '@root/types';

import { getOrdersLineItemsTotal, getOrdersServiceTotal, getOrdersTotal } from '../../helpers';
import { INewOrders } from '../../types';
import { IGenerateOrderPropPathInput } from '../Order/types';

import { ISummarySection } from './types';

const taxRateOptions = [
  { label: 'Commercial', value: CustomerGroupType.commercial },
  { label: 'Non-Commercial', value: CustomerGroupType.nonCommercial },
];

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Order.sections.Summary.';
const SummarySection: React.FC<ISummarySection> = ({
  isSubscriptionOrderType,
  onSuggestBestPayment,
}) => {
  const { values, errors, setFieldValue } = useFormikContext<INewOrders>();
  const { businessUnitId } = useBusinessContext();
  const [isPromoSearchShown, togglePromoSearchShown] = useToggle();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();
  const [isSurchargesModalOpen, openSurchargesModal, closeSurchargesModal] = useBoolean();

  const canChangeTaxRate = usePermission('orders:change-tax-rate:perform');

  const { formatCurrency } = useIntl();
  const { promoStore, customerStore, orderRequestStore, surchargeStore, i18nStore } = useStores();
  const { t } = useTranslation();

  const selectedOrderRequest = orderRequestStore.selectedEntity;

  useLayoutEffect(() => {
    setFieldValue('promoApplied', isPromoSearchShown);
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

  const subscriptionOrderPrices = useLinkSubscriptionOrderFormPrices(isSubscriptionOrderType);
  const [isAppliedTaxesModalOpen, openAppliedTaxesModal, closeAppliedTaxesModal] = useBoolean();

  const [servicesTotal, lineItemsTotal] = useMemo(() => {
    if (subscriptionOrderPrices) {
      const { subscriptionOrdersTotal, lineItemsTotal: lineItemsTotalData } =
        subscriptionOrderPrices.summary;

      return [subscriptionOrdersTotal, lineItemsTotalData];
    }
    const service = getOrdersServiceTotal(values.orders);
    const lineItems = getOrdersLineItemsTotal(values.orders);

    return [service, lineItems];
  }, [subscriptionOrderPrices, values.orders]);

  const beforeTaxesTotal = subscriptionOrderPrices?.summary.total ?? lineItemsTotal + servicesTotal;

  const surchargesTotal =
    useMemo(
      () =>
        values.orders.reduce((acc, order) => {
          const { orderSurchargesTotal } = calcNewOrderSurcharges({
            newOrder: order,
            surcharges: surchargeStore.values,
          });

          return acc + orderSurchargesTotal * (order.billableServiceQuantity ?? 1);
        }, 0),
      [surchargeStore.values, values.orders],
    ) ?? 0;

  const hasSurcharges = surchargesTotal > 0;

  const ordersTotals = useMemo(
    () =>
      getOrdersTotal({
        orders: values.orders,
        businessLineId: values.businessLineId,
        region: i18nStore.region,
        taxDistricts: values.taxDistricts,
        surcharges: surchargeStore.values,
        commercialTaxesUsed: values.commercialTaxesUsed,
      }),
    [
      i18nStore.region,
      surchargeStore.values,
      values.businessLineId,
      values.orders,
      values.taxDistricts,
      values.commercialTaxesUsed,
    ],
  );

  const taxesTotal = useMemo(
    () =>
      values.orders.reduce((acc, order) => {
        let serviceTotalWithSurcharges = Number(order.billableServicePrice) || 0;
        let lineItemsWithSurcharges = order.lineItems;

        if (order.applySurcharges) {
          ({ serviceTotalWithSurcharges, lineItemsWithSurcharges } = calcNewOrderSurcharges({
            newOrder: order,
            surcharges: surchargeStore.values,
          }));
        }

        return (
          acc +
          (values.taxDistricts
            ? calcTaxesForOrderService(order, {
                region: i18nStore.region,
                serviceTotal: serviceTotalWithSurcharges,
                lineItems: lineItemsWithSurcharges,
                thresholds: [],
                taxDistricts: values.taxDistricts,
                businessLineId: values.businessLineId,
                commercialTaxesUsed: values.commercialTaxesUsed,
              })
            : 0) *
            (order.billableServiceQuantity ?? 1)
        );
      }, 0),
    [
      values.orders,
      values.taxDistricts,
      values.businessLineId,
      i18nStore.region,
      surchargeStore.values,
      values.commercialTaxesUsed,
    ],
  );

  useEffect(() => {
    if (
      isSubscriptionOrderType &&
      subscriptionOrderPrices?.summary?.orderSurcharges?.length &&
      !isEqual(subscriptionOrderPrices.summary.orderSurcharges, values.surcharges)
    ) {
      setFieldValue('surcharges', subscriptionOrderPrices?.summary?.orderSurcharges);
    }
  }, [isSubscriptionOrderType, subscriptionOrderPrices, setFieldValue, values.surcharges]);

  useEffect(() => {
    if (values.type === ClientRequestType.OrderRequest && selectedOrderRequest) {
      setFieldValue('payments[0].amount', +ordersTotals.toFixed(2));
    }
  }, [taxesTotal, setFieldValue, values.type, selectedOrderRequest, surchargesTotal, ordersTotals]);

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

  const generateOrderPropsPath = ({ orderIndex, property }: IGenerateOrderPropPathInput) =>
    `orders[${orderIndex}].${property}`;

  const handleChangeApplySurcharges = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      setFieldValue(name, checked);

      values.orders.forEach((_, orderIndex) => {
        setFieldValue(
          generateOrderPropsPath({
            orderIndex,
            property: 'applySurcharges',
          }),
          checked,
        );
      });
    },
    [setFieldValue, values.orders],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        togglePromoSearchShown();
      }
    },
    [togglePromoSearchShown],
  );

  const summaryTitlePrefix = useMemo(() => {
    if (
      [ClientRequestType.NonServiceOrder, ClientRequestType.SubscriptionNonService].includes(
        values.type,
      )
    ) {
      return 'Non-Service Order';
    }

    if (values.type === ClientRequestType.SubscriptionOrder) {
      return 'Subscription Order';
    }

    return '';
  }, [values.type]);

  const handleSuggestBestPaymentKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onSuggestBestPayment();
      }
    },
    [onSuggestBestPayment],
  );

  return (
    <Section>
      <Subsection>
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Margin bottom="1">
              <Typography variant="headerThree">{summaryTitlePrefix} Summary</Typography>
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
                    name="promoId"
                    options={promoOptions}
                    value={values.promoId ?? ''}
                    onSelectChange={setFieldValue}
                    error={errors.promoId}
                    searchable
                    exactSearch
                  />
                </Layouts.Box>
              </Layouts.Flex>
            ) : (
              <Layouts.Margin top="3">
                <Typography
                  tabIndex={0}
                  variant="bodyMedium"
                  color="information"
                  cursor="pointer"
                  role="button"
                  onKeyDown={handleKeyDown}
                  onClick={togglePromoSearchShown}
                >
                  + Add Promo Code
                </Typography>
              </Layouts.Margin>
            )}
            {!isSubscriptionOrderType &&
            customerStore.selectedEntity?.status !== CustomerStatus.onHold &&
            ordersTotals !== 0 ? (
              <Layouts.Margin top="3">
                <Typography
                  color="information"
                  variant="bodyMedium"
                  cursor="pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleSuggestBestPaymentKeyDown}
                  onClick={onSuggestBestPayment}
                >
                  <Layouts.Flex alignItems="center">
                    <Layouts.IconLayout>
                      <BillingIcon />
                    </Layouts.IconLayout>
                    <Layouts.Margin bottom="1">
                      {t(`${I18N_PATH}SuggestBestPayment`)}
                    </Layouts.Margin>
                  </Layouts.Flex>
                </Typography>
              </Layouts.Margin>
            ) : null}
            <Layouts.Margin top="3">
              <Checkbox
                name="applySurcharges"
                value={values.applySurcharges}
                onChange={handleChangeApplySurcharges}
                tabIndex={0}
              >
                {t(`${I18N_PATH}ApplySurcharges`)}
              </Checkbox>
            </Layouts.Margin>
            {(values.taxDistricts ?? []).filter(district => district.taxesPerCustomerType).length >
            0 ? (
              <Layouts.Margin top="2">
                <Select
                  label={t(`${I18N_PATH}SelectTaxRate`)}
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
            <Layouts.Flex direction="column" alignItems="flex-end">
              <Protected permissions="orders:unlock-overrides:perform">
                <Switch
                  name="unlockOverrides"
                  value={values.unlockOverrides}
                  onChange={handleChangeUnlockOverrides}
                >
                  Unlock Overrides
                </Switch>
              </Protected>
            </Layouts.Flex>
            <Layouts.Box width="80%" float="right">
              <Layouts.Flex direction="column" alignItems="flex-end">
                {values.type !== ClientRequestType.NonServiceOrder &&
                values.type !== ClientRequestType.SubscriptionNonService ? (
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
                          onClick={() => {
                            if (taxesTotal > 0) {
                              return isSubscriptionOrderType
                                ? openAppliedTaxesModal
                                : openTaxesModal;
                            }
                            return undefined;
                          }}
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
            <Layouts.Box width="100px">{formatCurrency(ordersTotals)}</Layouts.Box>
          </Layouts.Flex>
        </Typography>
      </Subsection>
      {values.taxDistricts ? (
        <MultiTaxesCalculationModal
          isOpen={isTaxesModalOpen}
          onClose={closeTaxesModal}
          commercialTaxesUsed={values.commercialTaxesUsed}
        />
      ) : null}

      {isSubscriptionOrderType && subscriptionOrderPrices ? (
        <AppliedTaxesModal
          isOpen={isAppliedTaxesModalOpen}
          onClose={closeAppliedTaxesModal}
          taxesInfo={subscriptionOrderPrices.summary.taxesInfo}
        />
      ) : null}
      {surchargesTotal > 0 ? (
        <SurchargesCalculationModal
          isOpen={isSurchargesModalOpen}
          onClose={closeSurchargesModal}
          orders={values.orders}
        />
      ) : null}
    </Section>
  );
};

export default observer(SummarySection);
