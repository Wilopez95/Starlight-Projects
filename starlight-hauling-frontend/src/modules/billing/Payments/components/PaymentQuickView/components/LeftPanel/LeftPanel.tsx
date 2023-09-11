import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Badge, Typography } from '../../../../../../../common';
import { LeftPanelTools } from '../../../../../../../common/QuickView';
import { Divider } from '../../../../../../../common/TableTools';
import { getPaymentInvoicedStatusColor } from '../../../../../../../helpers';
import { useStores } from '../../../../../../../hooks';
import { IQuickViewLeftPanel } from '../../../../../../../quickViews/types';
import { type NewUnappliedPayment } from '../../../../types';

const LeftPanel: React.FC<IQuickViewLeftPanel> = ({ showCustomer }) => {
  const { paymentStore, customerStore } = useStores();
  const { formatCurrency } = useIntl();
  const { values } = useFormikContext<NewUnappliedPayment>();
  const selectedPayment = paymentStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;

  const amountValid = !Number.isNaN(+(values.amount ?? 0));
  const amount = amountValid ? values.amount : 0;
  const newBalance = amountValid ? values.newBalance : 0;
  const paymentType = values.paymentType;
  const isMemo = paymentType === 'creditMemo' || paymentStore.memoPaymentCreating;
  const isWriteOff = paymentType === 'writeOff' || paymentStore.writeOffCreating;

  const labels = {
    payment: {
      create: 'New Payment',
      details: selectedPayment ? `Payment# ${selectedPayment.id}` : '',
    },
    creditMemo: {
      create: 'New Credit Memo',
      details: 'Credit Memo Details',
    },
    writeOff: {
      create: 'New Write Off',
      details: 'Write Off Details',
    },
  };

  const paymentLabels =
    isMemo || isWriteOff ? labels[paymentType as 'creditMemo' | 'writeOff'] : labels.payment;
  const title = paymentLabels?.[selectedPayment ? 'details' : 'create'];

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography fontWeight="bold" variant="headerThree">
              {title}
            </Typography>
          </LeftPanelTools.Item>
          {!isWriteOff ? (
            <LeftPanelTools.Item>
              <Badge color={getPaymentInvoicedStatusColor(values.invoicedStatus)}>
                {startCase(values.invoicedStatus)}
              </Badge>
            </LeftPanelTools.Item>
          ) : null}
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
          {values.originalPaymentId ? (
            <LeftPanelTools.Item>
              <LeftPanelTools.Subitem>
                <Typography color="secondary" shade="desaturated">
                  Original Payment ID:
                </Typography>
              </LeftPanelTools.Subitem>
              <LeftPanelTools.Subitem>
                <Typography variant="bodyLarge">{values.originalPaymentId}</Typography>
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}
          {values.reverseData?.note ? (
            <LeftPanelTools.Item>
              <LeftPanelTools.Subitem>
                <Typography color="secondary" shade="desaturated">
                  Reverse Note:
                </Typography>
              </LeftPanelTools.Subitem>
              <LeftPanelTools.Subitem>
                <Typography color="secondary" shade="dark">
                  {values.reverseData?.note}
                </Typography>
              </LeftPanelTools.Subitem>
            </LeftPanelTools.Item>
          ) : null}
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>
      <LeftPanelTools.ItemsContainer>
        {!values.reverseData ? (
          <>
            <LeftPanelTools.Item inline>
              <Typography color="secondary">Previous Acc Balance:</Typography>
              <Typography variant="bodyLarge">{formatCurrency(values.prevBalance)}</Typography>
            </LeftPanelTools.Item>
            <LeftPanelTools.Item inline>
              <Typography color="secondary">
                {isWriteOff ? 'Write Off Amount:' : 'Payment Amount:'}
              </Typography>
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
          </>
        ) : null}
        {!isWriteOff ? (
          <>
            <Divider both />
            <LeftPanelTools.Item inline>
              <Typography color="secondary">
                {isMemo ? 'Credit Amount:' : 'Payment Amount:'}
              </Typography>
              <Typography variant="bodyLarge">{formatCurrency(amount)}</Typography>
            </LeftPanelTools.Item>
            <LeftPanelTools.Item inline>
              <Typography color="secondary">Applied:</Typography>
              <Typography variant="bodyLarge">
                {formatCurrency(selectedPayment?.appliedAmount)}
              </Typography>
            </LeftPanelTools.Item>
            {selectedPayment?.paidOutAmount ? (
              <LeftPanelTools.Item inline>
                <Typography color="secondary">PaidOut:</Typography>
                <Typography variant="bodyLarge">
                  {formatCurrency(selectedPayment?.paidOutAmount)}
                </Typography>
              </LeftPanelTools.Item>
            ) : null}
            <LeftPanelTools.Item inline>
              <Typography color="secondary" fontWeight="bold">
                Unapplied:
              </Typography>
              <Typography variant="bodyLarge" fontWeight="bold">
                {formatCurrency(selectedPayment?.unappliedAmount)}
              </Typography>
            </LeftPanelTools.Item>
          </>
        ) : null}
        {values.invoicedStatus === 'reversed' ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary" fontWeight="bold">
              Reversed:
            </Typography>
            <Typography variant="bodyLarge" fontWeight="bold">
              {formatCurrency(values.amount)}
            </Typography>
          </LeftPanelTools.Item>
        ) : null}
        {values.refundedAmount ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary" fontWeight="bold">
              Refunded amount:
            </Typography>
            <Typography variant="bodyLarge" fontWeight="bold">
              {formatCurrency(values.refundedAmount)}
            </Typography>
          </LeftPanelTools.Item>
        ) : null}
        {values.refundedOnAccountAmount ? (
          <LeftPanelTools.Item inline>
            <Typography color="secondary" fontWeight="bold">
              Refunded on account:
            </Typography>
            <Typography variant="bodyLarge" fontWeight="bold">
              {formatCurrency(values.refundedOnAccountAmount)}
            </Typography>
          </LeftPanelTools.Item>
        ) : null}
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
