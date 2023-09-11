/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo } from 'react';
import {
  InvoiceBuilder,
  SubscriptionInvoiceBuilder,
} from '@starlightpro/invoice-builder/build/index';
import { Layouts } from '@starlightpro/shared-components';

import { Modal, Typography } from '../../../../../../../common';
import { addressFormatShort } from '../../../../../../../helpers';
import { mapOrderInvoiceDraft, mapSubscriptionsInvoiceDraft } from '../../helpers';

import { type IInvoicePreviewModal } from './types';

import styles from './css/styles.scss';

const InvoicePreviewModal: React.FC<IInvoicePreviewModal> = ({
  currentCustomer,
  currentCompany,
  invoiceOrderDraft,
  invoiceSubscriptionDraft,
  isOpen,
  onClose,
}) => {
  let invoiceBuilderProps = null;
  let invoiceSubsBuilderProps = null;
  if (invoiceOrderDraft) {
    invoiceBuilderProps = useMemo(
      () =>
        mapOrderInvoiceDraft({
          customer: currentCustomer,
          orders: invoiceOrderDraft.orders,
          currentCompany,
          attachMediaPref: invoiceOrderDraft.attachMediaPref,
          attachTicketPref: invoiceOrderDraft.attachTicketPref,
        }),
      [
        currentCompany,
        currentCustomer,
        invoiceOrderDraft.attachMediaPref,
        invoiceOrderDraft.attachTicketPref,
        invoiceOrderDraft.orders,
      ],
    );
  } else {
    invoiceSubsBuilderProps = useMemo(
      () =>
        mapSubscriptionsInvoiceDraft({
          customer: currentCustomer,
          subscriptions: invoiceSubscriptionDraft?.subscriptions,
          currentCompany,
          attachMediaPref: invoiceSubscriptionDraft?.attachMediaPref,
        }),
      [
        currentCompany,
        currentCustomer,
        invoiceSubscriptionDraft?.attachMediaPref,
        invoiceSubscriptionDraft?.subscriptions,
      ],
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <div className={styles.container}>
        <Typography variant="headerThree">Invoice Preview</Typography>
        <Typography variant="bodyMedium">{currentCustomer.name}</Typography>
        <Typography variant="bodyMedium" color="secondary">
          {addressFormatShort(currentCustomer.billingAddress)}
        </Typography>
        <div className={styles.previewWrapper}>
          <Layouts.Scroll>
            {invoiceBuilderProps ? (
              <InvoiceBuilder preview customer={currentCustomer} {...invoiceBuilderProps} />
            ) : (
              <SubscriptionInvoiceBuilder
                preview
                customer={currentCustomer}
                {...invoiceSubsBuilderProps}
              />
            )}
          </Layouts.Scroll>
        </div>
      </div>
    </Modal>
  );
};

export default InvoicePreviewModal;
