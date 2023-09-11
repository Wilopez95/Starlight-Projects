import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { TaxCalculation } from '@root/consts';
import { useLineItemName, useMaterialName, useServiceItemName } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { ISummaryTaxItem } from './types';

const I18N_PATH = 'components.modals.TaxesCalculation.Text.';

const SummaryTaxItem: React.FC<ISummaryTaxItem> = ({
  showLabels,
  taxCalculation: {
    billableServiceId,
    billableLineItemId,
    districtName,
    value,
    calculation,
    materialId,
  },
}) => {
  const { formatCurrency, currencySymbol } = useIntl();
  const { t } = useTranslation();

  const lineItemName = useLineItemName(billableLineItemId);
  const serviceItemName = useServiceItemName(billableServiceId);
  const materialName = useMaterialName(materialId);

  const billableItemName = billableLineItemId ? lineItemName : serviceItemName;

  return (
    <Layouts.Padding bottom="1">
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex justifyContent="space-between" flexGrow={1}>
          <Layouts.Box width="140px">
            <Layouts.Padding right="2">
              {showLabels ? (
                <Layouts.Padding bottom="1">
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}TaxDistrict`)}
                  </Typography>
                </Layouts.Padding>
              ) : null}
              <Typography variant="bodyMedium">{districtName}</Typography>
            </Layouts.Padding>
          </Layouts.Box>
          <Layouts.Flex flexGrow={1} direction="column">
            <Layouts.Padding right="2">
              {showLabels ? (
                <Layouts.Padding bottom="1">
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}BillableItem`)}
                  </Typography>
                </Layouts.Padding>
              ) : null}
              <Typography variant="bodyMedium">{billableItemName}</Typography>
            </Layouts.Padding>
          </Layouts.Flex>
          <Layouts.Box width="140px">
            <Layouts.Padding right="2">
              {showLabels ? (
                <Layouts.Padding bottom="1">
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}Material`)}
                  </Typography>
                </Layouts.Padding>
              ) : null}
              <Typography variant="bodyMedium">{materialName}</Typography>
            </Layouts.Padding>
          </Layouts.Box>
          <Layouts.Box width="100px">
            {showLabels ? (
              <Layouts.Padding bottom="1">
                <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                  {t(`${I18N_PATH}TaxType`)}
                </Typography>
              </Layouts.Padding>
            ) : null}
            <Typography variant="bodyMedium">
              {calculation === TaxCalculation.Percentage
                ? t(`${I18N_PATH}Percentage`)
                : t(`${I18N_PATH}Flat`, { currencySymbol })}
            </Typography>
          </Layouts.Box>
        </Layouts.Flex>
        <Layouts.Box width="100px">
          <Layouts.Flex direction="column" alignItems="flex-end">
            {showLabels ? (
              <Layouts.Padding bottom="1">
                <Typography
                  variant="bodyMedium"
                  color="secondary"
                  shade="desaturated"
                  textAlign="right"
                >
                  {t(`${I18N_PATH}Amount`)}
                </Typography>
              </Layouts.Padding>
            ) : null}
            <Typography variant="bodyMedium">{formatCurrency(value)}</Typography>
          </Layouts.Flex>
        </Layouts.Box>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(SummaryTaxItem);
