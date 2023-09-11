import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { QuickViewContent, useQuickViewContext } from '@root/common';
import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { OrderHistory } from '@root/components';

import { IOrderHistoryQuickView } from './types';

const OrderHistoryQuickViewContent: React.FC<IOrderHistoryQuickView> = ({ orderId }) => {
  const { closeQuickView } = useQuickViewContext();
  const { t } = useTranslation();

  return (
    <QuickViewContent
      rightPanelElement={
        <>
          <Layouts.Padding padding="3">
            <div className={tableQuickViewStyles.quickViewTitle}>Order History</div>
          </Layouts.Padding>
          <Divider />

          <Layouts.Scroll>
            <Layouts.Padding padding="3">
              {orderId ? <OrderHistory orderId={orderId} /> : null}
            </Layouts.Padding>
          </Layouts.Scroll>
        </>
      }
      actionsElement={
        <Button full onClick={closeQuickView}>
          {t('Text.Close')}
        </Button>
      }
    />
  );
};

export default OrderHistoryQuickViewContent;
