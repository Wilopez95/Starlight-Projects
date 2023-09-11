import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';
import { type RecurrentOrder } from '@root/stores/entities';

const I18N_PATH = 'pages.CustomerRecurrentOrders.tables.MainInformation.sections.Summary.Text.';

const SummarySection: React.FC = () => {
  const { values } = useFormikContext<RecurrentOrder>();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  // const billableServiceQuantity = values.billableServiceQuantity ?? 1;
  const serviceFee = values.billableServicePrice ?? 0;
  // const serviceFee = (values.billableServicePrice ?? 0) * billableServiceQuantity;
  const billableItemsPrice = values.billableLineItemsTotal ?? 0;
  const taxesTotal =
    (values.grandTotal ?? 0) - (values.beforeTaxesTotal ?? 0) - (values.surchargesTotal ?? 0);
  const beforeTaxesTotal = values.beforeTaxesTotal ?? 0;
  const surchargesTotal = values.surchargesTotal ?? 0;
  const grandTotal = values.grandTotal ?? 0;

  return (
    <Layouts.Cell top="4">
      <Layouts.Grid gap="4" columns="3fr 1.5fr">
        <Typography variant="headerFour">{t(`${I18N_PATH}Summary`)}</Typography>
        <Layouts.Margin right="2">
          <Layouts.Grid gap="2" columns="150px 1fr">
            <Typography textAlign="right">{t(`${I18N_PATH}Service`)}:</Typography>
            <Typography textAlign="right">{formatCurrency(serviceFee)}</Typography>
            <Typography textAlign="right">{t(`${I18N_PATH}BillableItems`)}:</Typography>
            <Typography textAlign="right">{formatCurrency(billableItemsPrice)}</Typography>
            <Typography textAlign="right">{t(`${I18N_PATH}Total`)}:</Typography>
            <Typography textAlign="right">{formatCurrency(beforeTaxesTotal)}</Typography>
            {values.applySurcharges ? (
              <>
                <Typography textAlign="right">{t(`${I18N_PATH}Surcharges`)}:</Typography>
                <Typography textAlign="right">{formatCurrency(surchargesTotal)}</Typography>
              </>
            ) : null}
            <Typography textAlign="right">{t(`${I18N_PATH}Taxes`)}:</Typography>
            <Typography textAlign="right">{formatCurrency(taxesTotal)}</Typography>
          </Layouts.Grid>
        </Layouts.Margin>
        <Layouts.Cell width={2}>
          <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
            <Layouts.Padding padding="2">
              <Layouts.Grid gap="2" columns="150px 1fr">
                <Typography fontWeight="bold" as="span">
                  {t(`${I18N_PATH}GrandTotal`)}:
                </Typography>
                <Typography fontWeight="bold" as="span" textAlign="right">
                  {formatCurrency(grandTotal)}
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
