import React, { useContext } from 'react';
import {
  AutocompleteOptionContext,
  HighlightDecorator,
  Layouts,
} from '@starlightpro/shared-components';

import { Badge } from '@root/common/Badge/Badge';
import { FacilitySuggestion } from '@root/types/responseEntities';

export const Facility: React.FC = () => {
  const item = useContext<FacilitySuggestion>(
    AutocompleteOptionContext as React.Context<FacilitySuggestion>,
  );

  return (
    <Layouts.Flex justifyContent="space-between" flexGrow={1}>
      <Layouts.Flex direction="column">
        <HighlightDecorator highlight={item.highlight} property="address">
          {item.address}
        </HighlightDecorator>
        {`${item.city}, ${item.state}, ${item.zip}`}
      </Layouts.Flex>
      {item.sameTenant ? (
        <span>
          <Badge bgColor="information" color="information">
            My Facility
          </Badge>
        </span>
      ) : null}
    </Layouts.Flex>
  );
};
