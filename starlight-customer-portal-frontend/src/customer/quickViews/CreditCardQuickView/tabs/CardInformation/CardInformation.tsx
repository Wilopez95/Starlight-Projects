import React from 'react';

import { CreditCard } from '@root/customer/components';

const CardInformation: React.FC<{ isNew: boolean; viewMode: boolean }> = (props) => (
  <CreditCard {...props} />
);

export default CardInformation;
