import React, { useContext } from 'react';
import { AutocompleteOptionContext, HighlightDecorator } from '@starlightpro/shared-components';

import { Typography } from '@root/common/Typography/Typography';
import { AddressSuggestion } from '@root/types/responseEntities';

export const Address: React.FC = () => {
  const item = useContext<AddressSuggestion>(
    AutocompleteOptionContext as React.Context<AddressSuggestion>,
  );

  return (
    <Typography>
      {item.fullAddress ? (
        item.fullAddress
      ) : (
        <>
          <HighlightDecorator highlight={item.highlight} property="address">
            {item.address}
          </HighlightDecorator>
          {`${item.city}, ${item.state}, ${item.zip}`}
        </>
      )}
    </Typography>
  );
};
