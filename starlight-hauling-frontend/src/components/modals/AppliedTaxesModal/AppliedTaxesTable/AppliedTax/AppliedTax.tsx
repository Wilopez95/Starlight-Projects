import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TaxCalculation } from '@root/consts';
import { useLineItemName, useMaterialName, useServiceItemName } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { IAppliedTax } from './types';

const I18N_PATH = 'components.modals.TaxesCalculation.Text.';
const fallback = '-';

const AppliedTax: React.FC<IAppliedTax> = ({ taxCalculation, showLabels = false }) => {
  const {
    billableServiceId,
    billableLineItemId,
    calculatedTax,
    value,
    proratedTotal,
    calculation,
    quantity,
    materialId,
  } = taxCalculation;

  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const lineItemName = useLineItemName(billableLineItemId);
  const serviceItemName = useServiceItemName(billableServiceId);
  const materialName = useMaterialName(materialId);

  const taxName = materialName ?? (billableLineItemId ? lineItemName : serviceItemName);

  const formattedTaxValue = useMemo(() => {
    switch (calculation) {
      case TaxCalculation.Percentage:
        return t(`${I18N_PATH}AppliedPercentageTax`, {
          calculatedTax,
          taxName,
        });
      case TaxCalculation.Flat:
        return t(`${I18N_PATH}AppliedFlatTax`, {
          calculatedTax: formatCurrency(calculatedTax),
          taxName,
        });
      default:
        return fallback;
    }
  }, [calculation, t, calculatedTax, taxName, formatCurrency]);

  const formattedTaxDetails = useMemo(() => {
    switch (calculation) {
      case TaxCalculation.Percentage:
        return formatCurrency(value);
      case TaxCalculation.Flat:
        return `${t('Text.QTY')} ${quantity}`;
      default:
        return fallback;
    }
  }, [calculation, formatCurrency, quantity, t, value]);

  const calculatedValue = useMemo(() => {
    switch (calculation) {
      case TaxCalculation.Percentage:
        return `${calculatedTax} × ${formatCurrency(value)} = ${formatCurrency(proratedTotal)}`;
      case TaxCalculation.Flat:
        return `${formatCurrency(calculatedTax)} × ${quantity} = ${formatCurrency(proratedTotal)}`;
      default:
        return fallback;
    }
  }, [calculatedTax, calculation, formatCurrency, proratedTotal, quantity, value]);

  return (
    <Layouts.Padding bottom="1">
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Box width="70%">
          {showLabels ? (
            <Layouts.Padding bottom="1">
              <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                {t(`${I18N_PATH}AppliedTaxes`)}
              </Typography>
            </Layouts.Padding>
          ) : null}
          <Typography variant="bodyMedium" fontWeight="medium">
            {formattedTaxValue}
          </Typography>
          <Layouts.Padding top="0.5">
            <Typography
              as="span"
              variant="bodyMedium"
              fontWeight="medium"
              color="secondary"
              shade="desaturated"
            >
              {taxName}:
            </Typography>
            <Typography as="span" variant="bodyMedium" color="secondary" shade="desaturated">
              <Layouts.Padding as="span" left="0.5">
                {formattedTaxDetails}
              </Layouts.Padding>
            </Typography>
          </Layouts.Padding>
        </Layouts.Box>
        <Layouts.Box width="30%">
          <Layouts.Flex direction="column" alignItems="flex-end">
            {showLabels ? (
              <Layouts.Padding bottom="4">
                <Typography
                  variant="bodyMedium"
                  color="secondary"
                  shade="desaturated"
                  textAlign="right"
                >
                  {t(`${I18N_PATH}TaxCalculation`)}
                </Typography>
              </Layouts.Padding>
            ) : null}
            <Typography variant="bodyMedium">{calculatedValue}</Typography>
          </Layouts.Flex>
        </Layouts.Box>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(AppliedTax);
