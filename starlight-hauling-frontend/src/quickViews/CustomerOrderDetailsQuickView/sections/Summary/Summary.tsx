import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Typography } from '@root/common';
import { SurchargesCalculationModal, TaxesCalculationModal } from '@root/components/modals';
import { calcDetailsOrderSurcharges, isPartialTaxDistrict } from '@root/helpers';
import { useBoolean, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { Order } from '@root/stores/entities';
import { type IEntity, type IOrderLineItem, type ITaxDistrict } from '@root/types';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.Summary.Text.';

const SummarySection: React.FC = () => {
  const { lineItemStore, i18nStore } = useStores();
  const { values } = useFormikContext<Order>();
  const [isTaxesModalOpen, openTaxesModal, closeTaxesModal] = useBoolean();
  const [isSurchargesModalOpen, openSurchargesModal, closeSurchargesModal] = useBoolean();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const serviceFee = parseFloat((values.billableServicePrice ?? 0).toString());
  const billableItemsPrice = (values.billableLineItemsTotal ?? 0) + (values.thresholdsTotal ?? 0);
  const taxesTotal = values.grandTotal - values.beforeTaxesTotal - values.surchargesTotal;
  const areTaxDistrictsPartial = values.taxDistricts?.some(isPartialTaxDistrict);
  const taxesProps = taxesTotal > 0 ? { onClick: openTaxesModal, underlined: true } : {};
  const surchargesProps =
    values.surchargesTotal > 0 ? { onClick: openSurchargesModal, underlined: true } : {};

  let lineItemsWithSurcharges: Omit<IOrderLineItem, keyof IEntity>[] = values.lineItems ?? [];
  let serviceTotalWithSurcharges = serviceFee;
  let thresholdsWithSurcharges = values.thresholds ?? [];

  if (values.applySurcharges) {
    ({ lineItemsWithSurcharges, serviceTotalWithSurcharges, thresholdsWithSurcharges } =
      calcDetailsOrderSurcharges({
        order: values,
      }));
  }

  return (
    <Layouts.Cell top="4">
      <Layouts.Grid gap="4" columns="3fr 1.5fr">
        {lineItemStore.values.length > 0 && values.taxDistricts && !areTaxDistrictsPartial ? (
          <TaxesCalculationModal
            centered
            commercialTaxesUsed={values.commercialTaxesUsed}
            businessLineId={values.businessLine.id.toString()}
            region={i18nStore.region}
            isOpen={isTaxesModalOpen}
            onClose={closeTaxesModal}
            isOrderCanceled={values.status === 'canceled'}
            taxDistricts={values.taxDistricts as ITaxDistrict[]}
            serviceTotal={serviceTotalWithSurcharges}
            workOrder={values.workOrder}
            lineItems={lineItemsWithSurcharges ?? []}
            thresholds={thresholdsWithSurcharges}
            service={{
              billableServiceId: values.billableService?.originalId,
              materialId: values.material?.originalId,
              hasServiceAppliedSurcharges: values.billableServiceApplySurcharges,
            }}
            serviceName={values.billableService?.description}
            materialName={values.material?.description}
            applySurcharges={values.applySurcharges}
          />
        ) : null}
        {values.surchargesTotal > 0 ? (
          <SurchargesCalculationModal
            centered
            detailsOrder={values}
            isOpen={isSurchargesModalOpen}
            onClose={closeSurchargesModal}
          />
        ) : null}
        <Typography variant="bodyLarge" fontWeight="bold">
          {t(`${I18N_PATH}Summary`)}
        </Typography>
        <Layouts.Margin right="2">
          <Layouts.Grid gap="4" columns="150px 1fr">
            <Typography textAlign="right">{t(`${I18N_PATH}InitialOrderTotal`)}:</Typography>
            <Typography textAlign="right">{formatCurrency(values.initialGrandTotal)}</Typography>
            <Typography textAlign="right">{t(`${I18N_PATH}ServiceFee`)}:</Typography>
            <Typography textAlign="right">{formatCurrency(serviceFee)}</Typography>
            <Typography textAlign="right">{t(`${I18N_PATH}BillableItems`)}:</Typography>
            <Typography textAlign="right">{formatCurrency(billableItemsPrice)}</Typography>
            {values.applySurcharges ? (
              <>
                <Typography textAlign="right">{t(`${I18N_PATH}Surcharges`)}:</Typography>
                <Typography {...surchargesProps} textAlign="right">
                  {formatCurrency(values.surchargesTotal)}
                </Typography>
              </>
            ) : null}
            <Typography textAlign="right">{t(`${I18N_PATH}Taxes`)}:</Typography>
            <Typography {...taxesProps} textAlign="right">
              {formatCurrency(taxesTotal)}
            </Typography>
          </Layouts.Grid>
        </Layouts.Margin>
        <Layouts.Cell width={2}>
          <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
            <Layouts.Padding padding="2">
              <Layouts.Grid gap="4" columns="150px 1fr">
                <Typography fontWeight="bold" as="span">
                  {t(`${I18N_PATH}GrandTotal`)}:
                </Typography>
                <Typography fontWeight="bold" as="span" textAlign="right">
                  {formatCurrency(values.grandTotal)}
                </Typography>
              </Layouts.Grid>
            </Layouts.Padding>
          </Layouts.Box>
        </Layouts.Cell>
      </Layouts.Grid>
    </Layouts.Cell>
  );
};

export default SummarySection;
