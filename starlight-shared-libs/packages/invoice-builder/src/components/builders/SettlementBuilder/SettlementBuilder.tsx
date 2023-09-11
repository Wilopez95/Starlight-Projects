import React from 'react';
import { format } from 'date-fns';

import { formatMoney } from '../../../helpers';

import styles from '../styles.scss';
import type { ISettlementBuilder } from './types';

const dateFormat = 'dd MMM, yyyy';

const fallback = '-';

const SettlementBuilder: React.FC<ISettlementBuilder> = ({ transactions, settlementDate }) => {
  return (
    <div className={styles.wrapper}>
      <h1>Сredit Card Settlements</h1>
      <div className={styles.spaceBottom}>
        {format(settlementDate, dateFormat)} / {transactions.length} Transactions
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Transaction Note</th>
            <th className={styles.textRight}>Amount,$</th>
            <th className={styles.textRight}>Fee,$</th>
            <th className={styles.textRight}>Adjustment,$</th>
            <th className={styles.textRight}>Net,$</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className={styles.divider}>
              <td>{transaction.customerName ?? fallback}</td>
              <td>{transaction.transactionNote ?? fallback}</td>
              <td className={styles.textRight}>{formatMoney(transaction.amount)}</td>
              <td className={styles.textRight}>{formatMoney(transaction.adjustment)}</td>
              <td className={styles.textRight}>{formatMoney(transaction.fee)}</td>
              <td className={styles.textRight}>
                {formatMoney(transaction.amount - transaction.fee - transaction.adjustment)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SettlementBuilder;
