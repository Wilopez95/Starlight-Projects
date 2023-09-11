import React from 'react';
import { format } from 'date-fns';

import { addressExists, formatAddress, formatMoney, getCreditCardBrand } from '../../../helpers';

import styles from '../styles.scss';
import type { IReceiptBuilder } from './types';

import receiptStyles from './styles.scss';

const dateFormat = 'dd MMM, yyyy';

const ReceiptBuilder: React.FC<IReceiptBuilder> = ({
  logoUrl,
  physicalAddress,
  customer,
  order,
  payment,
  preview = false,
}) => {
  const previewClassName = `${preview ? styles.preview : ''}`;

  let paymentIdentifier: string;

  if (payment.paymentMethod === 'creditCard') {
    paymentIdentifier = `${getCreditCardBrand(
      payment.cardType,
    )}•••• ${payment.paymentIdentifier.slice(payment.paymentIdentifier.length - 4)}`;
  } else if (payment.paymentMethod === 'check') {
    paymentIdentifier = `Check# ${payment.paymentIdentifier}`;
  } else {
    paymentIdentifier = 'Cash';
  }

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
          <div className={styles.heading}>Receipt For</div>
          {customer.name}
        </div>
        {customer.invoiceConstruction !== 'byCustomer' && order ? (
          <div>
            <div className={styles.heading}>Job Site</div>
            {formatAddress(order.jobSite)}
          </div>
        ) : null}
      </div>
      <div className={receiptStyles.tableHeader}>Order Information</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order#</th>
            <th>Date</th>
            <th>Service</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Amount</th>
            <th className={styles.textRight}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.services.map((service, index) =>
            index === 0 ? (
              <tr key={index}>
                <td>{order.id}</td>
                <td>{format(order.serviceDate, dateFormat)}</td>
                <td>{service.description}</td>
                <td>{service.price.toFixed(2)}</td>
                <td>{service.quantity}</td>
                <td>{(service.price * service.quantity).toFixed(2)}</td>
                <td className={styles.textRight}>{order.beforeTaxesTotal.toFixed(2)}</td>
              </tr>
            ) : (
              <tr key={index}>
                <td />
                <td />
                <td>{service.description}</td>
                <td>{service.price.toFixed(2)}</td>
                <td>{service.quantity}</td>
                <td>{(service.price * service.quantity).toFixed(2)}</td>
                <td />
              </tr>
            ),
          )}
          {order.surchargesTotal != null && order.surchargesTotal !== 0 ? (
            <tr>
              <td />
              <td />
              <td>Surcharges</td>
              <td />
              <td />
              <td>{order.surchargesTotal.toFixed(2)}</td>
              <td />
            </tr>
          ) : null}
          {order.grandTotal !== order.beforeTaxesTotal ? (
            <tr>
              <td />
              <td />
              <td>Taxes</td>
              <td />
              <td />
              <td>
                {(
                  order.grandTotal -
                  order.beforeTaxesTotal -
                  (Number(order.surchargesTotal) || 0)
                ).toFixed(2)}
              </td>
              <td />
            </tr>
          ) : null}
        </tbody>
      </table>
      <div className={receiptStyles.tableDivider} />
      <div className={receiptStyles.total}>{order.grandTotal}</div>
      <div className={receiptStyles.tableHeader}>Order Payment</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Payment</th>
            <th>Date</th>
            <th>Transaction #</th>
            <th className={styles.textRight}>Paid Amount,$</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{paymentIdentifier}</td>
            <td>{format(payment.date, dateFormat)}</td>
            <td>{payment.paymentMethod === 'creditCard' ? payment.paymentRetRef : null}</td>
            <td className={styles.textRight}>{formatMoney(payment.amount, 2)}</td>
          </tr>
        </tbody>
      </table>
      <div className={receiptStyles.tableDivider} />
      <div className={receiptStyles.total}>{formatMoney(payment.amount, 2)}</div>
    </div>
  );
};

export default ReceiptBuilder;
