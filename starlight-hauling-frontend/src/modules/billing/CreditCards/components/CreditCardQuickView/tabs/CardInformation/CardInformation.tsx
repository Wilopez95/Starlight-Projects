import React from 'react';

import CreditCard from '../../../CreditCard/CreditCard';

const CardInformation: React.FC<{ isNew: boolean; viewMode: boolean }> = props => (
  <CreditCard {...props} />
);

export default CardInformation;
