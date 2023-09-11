import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AutocompleteOptionContext, HighlightDecorator } from '@starlightpro/shared-components';

import { Typography } from '@root/common/Typography/Typography';
import { WorkOrderSuggestion } from '@root/types/responseEntities';

import { I18N_TEMPLATE_PATH } from '../helpers';

export const WorkOrder: React.FC = () => {
  const item = useContext<WorkOrderSuggestion>(
    AutocompleteOptionContext as React.Context<WorkOrderSuggestion>,
  );
  const { t } = useTranslation();

  return (
    <div>
      <Typography variant="bodyMedium">
        {t(`${I18N_TEMPLATE_PATH}WorkOrder.WorkOrder`)}#{' '}
        <HighlightDecorator highlight={item.highlight} property="woNumber">
          {item.woNumber}
        </HighlightDecorator>
      </Typography>
      <Typography color="secondary" variant="bodyMedium" shade="desaturated">
        {item.customerName}
      </Typography>
    </div>
  );
};
