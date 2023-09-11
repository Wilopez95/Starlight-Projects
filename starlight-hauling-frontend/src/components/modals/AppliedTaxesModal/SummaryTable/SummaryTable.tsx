import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import SummaryTaxItem from './SummaryTaxItem/SummaryTaxItem';
import { ISummaryTable } from './types';

const I18N_PATH = 'components.modals.TaxesCalculation.Text.';

const Summary: React.FC<ISummaryTable> = ({ taxesInfo }) => {
  const appliedTaxes = useMemo(
    () => taxesInfo.taxCalculations.reduce((data, item) => [...data, ...item], []),
    [taxesInfo.taxCalculations],
  );
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  return (
    <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
      <Layouts.Padding bottom="2" left="3" right="3">
        <Layouts.Padding top="2" bottom="2">
          <Typography variant="headerFour">{t(`${I18N_PATH}Summary`)}</Typography>
        </Layouts.Padding>
        {appliedTaxes.map((taxCalculation, index) => (
          <SummaryTaxItem
            key={`${taxCalculation.districtName}-${
              taxCalculation.materialId ? `materialId-${taxCalculation.materialId}` : ''
            }-${
              taxCalculation.billableLineItemId
                ? `billableLineItemId-${taxCalculation.billableLineItemId}`
                : ''
            }-${
              taxCalculation.billableServiceId
                ? `billableServiceId-${taxCalculation.billableServiceId}`
                : ''
            }
            }
          `}
            taxCalculation={taxCalculation}
            showLabels={index === 0}
          />
        ))}
        <Layouts.Flex justifyContent="flex-end">
          <Layouts.Box width="100px">
            <Typography variant="bodyMedium" fontWeight="medium">
              {t('Text.Total')}
            </Typography>
          </Layouts.Box>
          <Layouts.Box width="100px">
            <Typography variant="bodyMedium" fontWeight="medium" textAlign="right">
              {formatCurrency(taxesInfo.taxesTotal)}
            </Typography>
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Padding>
    </Layouts.Box>
  );
};

export default observer(Summary);
