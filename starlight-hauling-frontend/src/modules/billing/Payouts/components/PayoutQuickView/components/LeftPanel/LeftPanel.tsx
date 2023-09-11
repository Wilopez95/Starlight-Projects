import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../../common';
import { LeftPanelTools } from '../../../../../../../common/QuickView';
import { useStores } from '../../../../../../../hooks';
import { IQuickViewLeftPanel } from '../../../../../../../quickViews/types';
import { type NewPayout } from '../../../../types';

const LeftPanel: React.FC<IQuickViewLeftPanel> = ({ showCustomer }) => {
  const { payoutStore, customerStore } = useStores();
  const { values } = useFormikContext<NewPayout>();
  const { formatCurrency } = useIntl();
  const selectedPayout = payoutStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;

  const prevBalance = values.prevBalance;
  const amount = values.amount;
  const newBalance = prevBalance + amount;

  let title = 'New Payout';

  if (selectedPayout) {
    title = 'Payout Details';
  }

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography fontWeight="bold" variant="headerThree">
              {title}
            </Typography>
          </LeftPanelTools.Item>
          {showCustomer ? (
            <LeftPanelTools.Item>
              <LeftPanelTools.Subitem>
                <Typography color="secondary" shade="desaturated">
                  Customer:
                </Typography>
              </LeftPanelTools.Subitem>
              <LeftPanelTools.Subitem>
                <Typography variant="bodyLarge">{selectedCustomer?.name}</Typography>
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color="secondary">Previous Acc Balance</Typography>
          <Typography variant="bodyLarge">{formatCurrency(prevBalance)}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary">Payout Amount:</Typography>
          <Typography variant="bodyLarge">{formatCurrency(amount)}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" fontWeight="bold">
            New Balance:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(newBalance)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
