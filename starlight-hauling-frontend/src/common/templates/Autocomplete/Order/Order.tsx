import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AutocompleteOptionContext, HighlightDecorator } from '@starlightpro/shared-components';

import { Typography } from '@root/common/Typography/Typography';
import { OrderSuggestion } from '@root/types/responseEntities';

import { I18N_TEMPLATE_PATH } from '../helpers';

export const Order: React.FC = () => {
  const item = useContext<OrderSuggestion>(
    AutocompleteOptionContext as React.Context<OrderSuggestion>,
  );
  const { t } = useTranslation();

  return (
    <div>
      <Typography variant="bodyMedium">
        {t(`${I18N_TEMPLATE_PATH}Order.Order`)}#{' '}
        <HighlightDecorator highlight={item.highlight} property="id">
          {item.id}
        </HighlightDecorator>
      </Typography>
      <Typography color="secondary" variant="bodyMedium" shade="desaturated">
        {item.customerName}
      </Typography>
    </div>
  );
};
