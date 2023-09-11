import React from 'react';
import { observer } from 'mobx-react-lite';

import { TablePageContainer } from '@root/core/common/TableTools';
import { CustomerInfoBlock } from '@root/customer/components';

import * as Styles from './css/styles';
import { ICustomerPortalLayout } from './types';

import Css from './css/style.scss';

const CustomerPortalTabLayout: React.FC<ICustomerPortalLayout> = ({ children }) => {
  return (
    <Styles.Layout variant='bodyMedium'>
      <CustomerInfoBlock />
      <TablePageContainer className={Css.layoutContent}>{children}</TablePageContainer>
    </Styles.Layout>
  );
};

export default observer(CustomerPortalTabLayout);
