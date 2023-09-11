import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';

import { IQuickView } from '../../../types';
import SubscriptionOrderHeader from '../sections/SubscriptionOrderHeader/SubscriptionOrderHeader';
import SubscriptionOrderContent from '../SubscriptionOrderContent/SubscriptionOrderContent';

const RightPanel: React.FC<IQuickView> = ({ tableContainerRef }) => (
  <>
    <div className={tableQuickViewStyles.header}>
      <SubscriptionOrderHeader />
    </div>
    <Divider top />
    <Layouts.Scroll>
      <SubscriptionOrderContent tableContainerRef={tableContainerRef} size="three-quarters" />
    </Layouts.Scroll>
  </>
);

export default observer(RightPanel);
