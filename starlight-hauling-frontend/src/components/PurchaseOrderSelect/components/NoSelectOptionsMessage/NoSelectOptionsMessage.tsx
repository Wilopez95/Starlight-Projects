import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import PurchaseOrderFieldFooter from '../PurchaseOrderFieldFooter/PurchaseOrderFieldFooter';

const NoSelectOptionsMessage: React.FC<{ onClick(): void }> = ({ onClick }) => (
  <Layouts.Padding padding="1" left="1.5" onClick={onClick}>
    <PurchaseOrderFieldFooter />
  </Layouts.Padding>
);

export default NoSelectOptionsMessage;
