import React, { useContext } from 'react';
import { AutocompleteOptionContext } from '@starlightpro/shared-components';

import { Typography } from '@root/common/Typography/Typography';
import { TaxDistrictType } from '@root/types';
import { IAdministrativeSearchResponse } from '@root/types/responseEntities';

export const Administrative: React.FC = () => {
  const item = useContext<IAdministrativeSearchResponse>(
    AutocompleteOptionContext as React.Context<IAdministrativeSearchResponse>,
  );

  const subtitle = item.level === TaxDistrictType.Primary ? undefined : item.primaryUnit;

  return (
    <div>
      <Typography variant="bodyMedium">{item?.name ?? ''}</Typography>
      <Typography color="secondary" variant="bodyMedium" shade="desaturated">
        {subtitle}
      </Typography>
    </div>
  );
};
