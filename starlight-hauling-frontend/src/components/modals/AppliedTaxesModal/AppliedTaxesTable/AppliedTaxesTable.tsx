import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import AppliedTax from './AppliedTax/AppliedTax';
import { IAppliedTaxesTable } from './types';

const I18N_PATH = 'components.modals.TaxesCalculation.Text.';

const AppliedTaxesTable: React.FC<IAppliedTaxesTable> = ({ taxesInfo }) => {
  const { t } = useTranslation();

  return (
    <Layouts.Padding bottom="2" left="3" right="3">
      {taxesInfo.taxCalculations.map((taxCalculations, districtIndex) => (
        <Layouts.Padding key={taxesInfo.taxDistrictNames[districtIndex]}>
          <Layouts.Padding top="2" bottom="2">
            <Typography variant="headerFour">
              {t(`${I18N_PATH}Taxes`, { districtName: taxesInfo.taxDistrictNames[districtIndex] })}
            </Typography>
          </Layouts.Padding>
          {taxCalculations.map((taxCalculation, taxIndex) => (
            <AppliedTax
              key={
                taxCalculation.materialId ??
                taxCalculation.billableLineItemId ??
                taxCalculation.billableServiceId
              }
              taxCalculation={taxCalculation}
              showLabels={taxIndex === 0}
            />
          ))}
        </Layouts.Padding>
      ))}
    </Layouts.Padding>
  );
};

export default observer(AppliedTaxesTable);
