import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { IInvoicingSubscriptions } from 'packages/invoice-builder/src/types';

import { addressExists, formatAddress, formatMoney } from '../../../helpers';

import styles from '../styles.scss';
import { calculateDueDate, getPaymentTermsDisplayString } from './helpers';
import type { IInvoiceBuilder } from './types';

import localStyles from './styles.scss';

const dateFormat = 'dd MMM, yyyy';

const SubscriptionInvoiceBuilder: React.FC<IInvoiceBuilder> = ({
  payments,
  logoUrl,
  physicalAddress,
  customer,
  subscriptions,
  preview = false,
}) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInvoice, setTotalInvoice] = useState(0);
  const [totalTaxes] = useState(0);
  const [totalSurcharges] = useState(0);

  useEffect(() => {
    if (subscriptions?.length) {
      const total = subscriptions
        .map((obj: IInvoicingSubscriptions) => obj.totalPriceForSubscription)
        .reduce((acc: number, curr: number) => acc + curr);

      setTotalInvoice(total);
    }
  }, [subscriptions]);

  useEffect(() => {
    setTotalAmount(totalInvoice + totalTaxes + totalSurcharges);
  }, [totalInvoice, totalTaxes, totalSurcharges]);

  const previewClassName = `${preview ? styles.preview : ''}`;

  return (
    <div className={`${styles.wrapper} ${previewClassName}`}>
      <div className={styles.header}>
        {logoUrl ? (
          <img src={logoUrl} alt="logo" className={`${styles.logo} ${previewClassName}`} />
        ) : null}
        {physicalAddress && addressExists(physicalAddress) ? formatAddress(physicalAddress) : null}
      </div>
      <div className={styles.generalInformation}>
        <div>
          <div className={styles.heading}>Bill to</div>
          {formatAddress(customer.billingAddress)}
        </div>
        {customer.invoiceConstruction !== 'byCustomer' ? (
          <div>
            <div className={styles.heading}>Job Site</div>
            {physicalAddress && addressExists(physicalAddress)
              ? formatAddress(physicalAddress)
              : null}
          </div>
        ) : null}
        <div className={localStyles.invoiceInformation}>
          <div className={localStyles.label}>Invoice Date</div>
          <div>{format(new Date(), dateFormat)}</div>

          <div className={localStyles.label}>Due Date</div>
          <div>
            {format(
              customer.paymentTerms ? calculateDueDate(customer.paymentTerms) : new Date(),
              dateFormat,
            )}
          </div>
          {customer.paymentTerms ? (
            <>
              <div className={localStyles.label}>Payment Terms</div>
              <div>{getPaymentTermsDisplayString(customer.paymentTerms)}</div>
            </>
          ) : null}
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={localStyles.subsField}>Subscription#</th>
            <th className={localStyles.dateField}>Date / Billing Period</th>
            <th>Billable Item</th>
            <th>Rate</th>
            <th className={localStyles.quantityField}>Qty</th>
            <th className={styles.textRight}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions?.map((subscription: IInvoicingSubscriptions, index: number) => (
            <React.Fragment key={subscription.id}>
              <tr key={index}>
                <td className={localStyles.title}>{`Subscription #${subscription.id}`}</td>
                <td>{`${format(subscription.nextBillingPeriodFrom, dateFormat)}-${format(
                  subscription.nextBillingPeriodTo,
                  dateFormat,
                )}`}</td>
                <td>{subscription.serviceItems[0].billableService.description}</td>
                <td>{formatMoney(subscription.serviceItems[0].price)}</td>
                <td className={localStyles.quantityField}>
                  {subscription.serviceItems[0].quantity}
                </td>
                <td className={styles.textRight}>
                  {formatMoney(subscription.totalPriceForSubscription)}
                </td>
              </tr>
              {subscription.serviceItems[0].lineItems.length ? (
                <>
                  <tr>
                    <td className={localStyles.subtitle}>Line Items</td>
                  </tr>
                  {subscription.serviceItems[0].lineItems.map((lineItem, index2: number) => (
                    <tr key={index2}>
                      <td />
                      <td>
                        {`${format(subscription.nextBillingPeriodFrom, dateFormat)}-${format(
                          subscription.nextBillingPeriodTo,
                          dateFormat,
                        )}`}
                      </td>
                      <td />
                      <td>{formatMoney(lineItem.price)}</td>
                      <td className={localStyles.quantityField}>{lineItem.quantity}</td>
                      <td className={styles.textRight}>
                        {formatMoney(lineItem.quantity * lineItem.price)}
                      </td>
                    </tr>
                  ))}
                </>
              ) : null}
              {subscription.serviceItems[0].subscriptionOrders.length ? (
                <>
                  <tr>
                    <td className={localStyles.subtitle}> Subscriptions Orders</td>
                  </tr>
                  {subscription.serviceItems[0].subscriptionOrders.map(
                    (subsOrder, index3: number) => (
                      <tr key={index3}>
                        <td
                          className={localStyles.subsField}
                        >{`Subscription Order #${subsOrder.sequenceId}`}</td>
                      </tr>
                    ),
                  )}
                </>
              ) : null}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className={styles.summary}>
        <div className={styles.label}>Surcharges</div>
        <div>{formatMoney(totalSurcharges)}</div>
        <div className={styles.label}>Taxes</div>
        <div>{formatMoney(totalTaxes)}</div>
        <div className={styles.label}>Invoice Total</div>
        <div>{formatMoney(totalInvoice)}</div>
        <div className={styles.label}>Payments</div>
        <div>{formatMoney(payments)}</div>
        <div className={styles.divider} />
        <div className={`${styles.label} ${styles.total} ${previewClassName}`}>Balance</div>
        <div className={`${styles.total} ${previewClassName}`}>{formatMoney(totalAmount)}</div>
      </div>
    </div>
  );
};

export default SubscriptionInvoiceBuilder;
