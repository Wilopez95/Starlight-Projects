import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@starlightpro/shared-components';

import { BusinessLineTypeSymbol, getBusinessLineNameByType } from '@root/consts';

import { Label } from './styles';

interface IBusinessLineTypeLabel {
  businessLineType?: BusinessLineTypeSymbol;
}

export const BusinessLineTypeLabel: React.FC<IBusinessLineTypeLabel> = ({ businessLineType }) => {
  const { t } = useTranslation();

  if (!businessLineType) {
    return null;
  }

  return (
    <Tooltip position="top" text={t(getBusinessLineNameByType(businessLineType))}>
      <Label textAlign="center" variant="caption" cursor="pointer">
        {BusinessLineTypeSymbol[businessLineType]}
      </Label>
    </Tooltip>
  );
};
