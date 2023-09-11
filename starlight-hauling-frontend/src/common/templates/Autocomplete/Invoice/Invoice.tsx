import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AutocompleteOptionContext, HighlightDecorator } from '@starlightpro/shared-components';

import { Typography } from '@root/common/Typography/Typography';
import { InvoiceSuggestion } from '@root/types/responseEntities';

import { I18N_TEMPLATE_PATH } from '../helpers';

export const Invoice: React.FC = () => {
  const item = useContext<InvoiceSuggestion>(
    AutocompleteOptionContext as React.Context<InvoiceSuggestion>,
  );
  const { t } = useTranslation();

  return (
    <div>
      <Typography variant="bodyMedium">
        {t(`${I18N_TEMPLATE_PATH}Invoice.Invoice`)}#{' '}
        <HighlightDecorator highlight={item.highlight} property="id">
          {item.id}
        </HighlightDecorator>
      </Typography>
      <Typography color="secondary" variant="bodyMedium" shade="desaturated">
        {item.customer?.name}
      </Typography>
    </div>
  );
};
