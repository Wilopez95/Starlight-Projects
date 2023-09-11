import React, { useCallback } from 'react';
import cx from 'classnames';

import { Modal } from '@root/common';
import { NewCustomerForm } from '@root/components/forms';
import { INewCustomerData } from '@root/components/forms/NewCustomer/types';

import { IFormModal } from '../types';

import styles from './css/styles.scss';

const NewCustomerModal: React.FC<IFormModal<INewCustomerData>> = ({
  isOpen,
  onClose,
  onFormSubmit,
  overlayClassName,
  className,
}) => {
  const handleFormSubmit = useCallback(
    (data: INewCustomerData) => {
      onFormSubmit({
        ...data,
        billingAddress: data.billingAddress.billingAddressSameAsMailing
          ? data.mailingAddress
          : data.billingAddress,
        statementEmails: data.statementSameAsInvoiceEmails
          ? data.invoiceEmails
          : data.statementEmails,
        notificationEmails: data.notificationSameAsInvoiceEmails
          ? data.invoiceEmails
          : data.notificationEmails,
      });
    },
    [onFormSubmit],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={cx(className, styles.modal)}
      overlayClassName={cx(overlayClassName, styles.overlay)}
    >
      <NewCustomerForm onSubmit={handleFormSubmit} onClose={onClose} />
    </Modal>
  );
};

export default NewCustomerModal;
