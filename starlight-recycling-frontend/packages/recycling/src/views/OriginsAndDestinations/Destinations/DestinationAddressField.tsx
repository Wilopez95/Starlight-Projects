import React, { memo } from 'react';

export interface DestinationAddressFieldProps {
  record?: any;
  label: JSX.Element;
  sortable?: boolean;
}

export const DestinationAddressField = memo<DestinationAddressFieldProps>(({ record }) => {
  return (
    <span>
      {[
        [record['addressLine1'], record['addressLine2']].filter((v) => !!v?.trim()).join(', '),
        record['city'],
        record['state'],
        record['zip'],
      ]
        .filter((v) => !!v?.trim())
        .join(', ')}
    </span>
  );
});
