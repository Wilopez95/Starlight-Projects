import React from 'react';

import { InvoicePlaceholder } from '../../../../../../../assets';

import styles from './css/styles.scss';

const InvoicingLoader: React.FC = () => (
  <div className={styles.loader}>
    <InvoicePlaceholder />
    <div>
      Please wait a moment while we generate your invoices, final payments and charges are being
      calculated and captured
    </div>
  </div>
);

export default InvoicingLoader;
