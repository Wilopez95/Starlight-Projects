import React from 'react';
import { HighlightDecorator } from '@starlightpro/shared-components';

import { CustomerSuggestion, CustomerSuggestionFields } from '@root/types/responseEntities';

export const CustomersListItem: React.FC<{
  field: CustomerSuggestionFields;
  item: CustomerSuggestion;
  value?: string;
  separator?: string | React.ReactNode;
}> = ({ field, item, value, separator = '   ' }) => {
  if (!value) {
    return null;
  }

  return (
    <>
      {separator}
      <HighlightDecorator highlight={item.highlight} property={field}>
        {value}
      </HighlightDecorator>
    </>
  );
};
