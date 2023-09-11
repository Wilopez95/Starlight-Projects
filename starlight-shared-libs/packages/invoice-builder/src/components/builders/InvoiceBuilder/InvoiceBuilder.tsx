import React from 'react';
import { format } from 'date-fns';

import { addressExists, formatAddress, formatMoney } from '../../../helpers';

import styles from '../styles.scss';
import { calculateDueDate, getPaymentTermsDisplayString } from './helpers';
import type { IInvoiceBuilder } from './types';

import localStyles from './styles.scss';

const dateFormat = 'dd MMM, yyyy';

const InvoiceBuilder: React.FC<IInvoiceBuilder> = ({
  logoUrl,
  physicalAddress,
  customer,
  orders,
  invoiceNumber,
  payments,
  preview = false,
}) => {
  const taxesTotal = orders.reduce(
    (acc, order) => acc + (order.grandTotal - order.beforeTaxesTotal - order.surchargesTotal),
    0,
  );

  const surchargesTotal = orders.reduce((acc, order) => acc + order.surchargesTotal, 0);

  const invoiceTotal = orders.reduce((acc, order) => acc + order.beforeTaxesTotal, 0);

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
        {customer.invoiceConstruction !== 'byCustomer' && orders[0] ? (
          <div>
            <div className={styles.heading}>Job Site</div>
            {formatAddress(orders[0].jobSite)}
          </div>
        ) : null}
        <div className={localStyles.invoiceInformation}>
          {invoiceNumber ? (
            <>
              <div className={localStyles.label}>Invoice #</div>
              <div>{invoiceNumber}</div>
            </>
          ) : null}
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
            <th>Order#</th>
            <th>PO#</th>
            <th>WO#</th>
            <th>Date#</th>
            <th>Service</th>
            <th>Ticket</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Amount</th>
            <th className={styles.textRight}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              {order.services.map((service, index) =>
                index === 0 ? (
                  <tr key={index}>
                    <td>{order.id}</td>
                    <td>{order.poNumber}</td>
                    <td>{order.woNumber}</td>
                    <td>{format(order.serviceDate, dateFormat)}</td>
                    <td>{service.description}</td>
                    <td>{order.ticket}</td>
                    <td>{service.price.toFixed(2)}</td>
                    <td>{service.quantity}</td>
                    <td>{(service.price * service.quantity).toFixed(2)}</td>
                    <td className={styles.textRight}>{order.beforeTaxesTotal.toFixed(2)}</td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td />
                    <td />
                    <td />
                    <td>{service.description}</td>
                    <td />
                    <td>{service.price.toFixed(2)}</td>
                    <td>{service.quantity}</td>
                    <td>{(service.price * service.quantity).toFixed(2)}</td>
                    <td />
                  </tr>
                ),
              )}
              {order.surchargesTotal > 0 ? (
                <tr className={styles.divider}>
                  <td />
                  <td />
                  <td />
                  <td>Surcharges</td>
                  <td />
                  <td />
                  <td />
                  <td>{order.surchargesTotal.toFixed(2)}</td>
                  <td />
                </tr>
              ) : null}
              {order.grandTotal !== order.beforeTaxesTotal + order.surchargesTotal ? (
                <tr className={styles.divider}>
                  <td />
                  <td />
                  <td />
                  <td>Taxes</td>
                  <td />
                  <td />
                  <td />
                  <td>
                    {(order.grandTotal - order.surchargesTotal - order.beforeTaxesTotal).toFixed(2)}
                  </td>
                  <td />
                </tr>
              ) : null}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className={styles.summary}>
        <div className={styles.label}>Surcharges</div>
        <div>{formatMoney(surchargesTotal)}</div>
        <div className={styles.label}>Taxes</div>
        <div>{formatMoney(taxesTotal)}</div>
        <div className={styles.label}>Invoice Total</div>
        <div>{formatMoney(invoiceTotal)}</div>
        <div className={styles.label}>Payments</div>
        <div>{formatMoney(payments)}</div>
        <div className={styles.divider} />
        <div className={`${styles.label} ${styles.total} ${previewClassName}`}>Balance</div>
        <div className={`${styles.total} ${previewClassName}`}>
          {formatMoney(invoiceTotal + surchargesTotal + taxesTotal - payments)}
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;
