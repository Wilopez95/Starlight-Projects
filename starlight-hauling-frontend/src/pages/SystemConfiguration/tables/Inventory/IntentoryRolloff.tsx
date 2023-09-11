import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';

import { useBusinessContext } from '@root/hooks';

import { RollOffContentWrapper } from './styles';

const I18N_PATH = 'pages.SystemConfiguration.tables.Inventory.Text.';

export const InventoryRolloff: React.FC = () => {
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();

  const redirectUrl = `${process.env
    .DISPATCH_FE_URL!}/business-units/${businessUnitId}/inventory-board`;

  return (
    <RollOffContentWrapper height="100%" backgroundColor="white">
      <Typography variant="bodyLarge">{t(`${I18N_PATH}RollOffDescription`)}</Typography>
      <Typography variant="bodyLarge">{t(`${I18N_PATH}ProceedToDispatcher`)}</Typography>
      <Layouts.Margin top="3">
        <Layouts.Box minWidth="270px">
          <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" full>
              {t(`${I18N_PATH}ProceedToDispatcher`)}
            </Button>
          </a>
        </Layouts.Box>
      </Layouts.Margin>
    </RollOffContentWrapper>
  );
};
