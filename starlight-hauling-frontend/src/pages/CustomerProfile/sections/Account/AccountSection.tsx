import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { AutopayEnum, BillingCycleEnum } from '@root/consts';
import { formatCreditCard } from '@root/helpers';
import { useStores } from '@root/hooks';
import { ICustomerPageParams } from '@root/pages/Customer/types';
import { InvoiceConstruction, PaymentTerms } from '@root/types';

import styles from '../../css/styles.scss';

interface IAccountSection {
  onAccount: boolean;
  notificationEmails?: string[];
  statementEmails?: string[];
  paymentTerms?: PaymentTerms;
  billingCycle?: BillingCycleEnum;
  invoiceConstruction?: InvoiceConstruction;
  financeCharge: number | null;
  invoiceEmails?: string[];
  sendInvoicesByPost?: boolean;
  sendInvoicesByEmail?: boolean;
  autopayType?: AutopayEnum;
}

const fallback = '-';
const byOrder = 'byOrder';
const I18N_PATH = 'pages.CustomerProfile.sections.Account.AccountSection.Text.';

const AccountSection: React.FC<IAccountSection> = ({
  onAccount,
  invoiceEmails,
  statementEmails,
  notificationEmails,
  paymentTerms,
  billingCycle,
  invoiceConstruction,
  financeCharge,
  sendInvoicesByEmail,
  sendInvoicesByPost,
  autopayType,
}) => {
  const { t } = useTranslation();
  const { creditCardStore, customerStore } = useStores();
  const { customerId } = useParams<ICustomerPageParams>();
  const [creditCardLabel, setCreditCardLabel] = useState<string>('');

  useEffect(() => {
    if (!customerStore.isOpenEditQuickView) {
      setCreditCardLabel(
        creditCardStore.values &&
          formatCreditCard(creditCardStore.values.find(elem => elem.isAutopay)),
      );
    }
  }, [creditCardStore.values, customerId, customerStore, customerStore.isOpenEditQuickView]);

  return (
    <>
      <tr>
        <td colSpan={2}>
          <Typography className={styles.sectionHeading} variant="bodyLarge" fontWeight="bold">
            {t(`${I18N_PATH}Account`)}
          </Typography>
        </td>
      </tr>
      <tr>
        <td className={styles.label}>{t(`${I18N_PATH}PaymentMethod`)}</td>
        <td>{onAccount ? t(`${I18N_PATH}OnAccount`) : t(`${I18N_PATH}Prepaid`)}</td>
        <td className={styles.label}>{t(`${I18N_PATH}PaymentTerms`)}</td>
        <td>
          {paymentTerms === 'cod'
            ? paymentTerms.toUpperCase()
            : startCase(paymentTerms) || fallback}
        </td>
      </tr>
      <tr>
        <td className={styles.label}>{t(`${I18N_PATH}BillingCycle`)}</td>
        <td>{startCase(billingCycle) || fallback}</td>
        <td className={styles.label}>{t(`${I18N_PATH}FinanceCharges`)}</td>
        <td>{financeCharge ? `${financeCharge} %` : t(`${I18N_PATH}Standard`)}</td>
      </tr>
      <tr>
        <td className={styles.label}>{t(`${I18N_PATH}SendInvoiceBy`)}</td>
        <td>
          {sendInvoicesByEmail ? t(`${I18N_PATH}Email`) : null}
          {sendInvoicesByEmail && sendInvoicesByPost ? ` ${t(`${I18N_PATH}And`)} ` : null}
          {sendInvoicesByPost ? t(`${I18N_PATH}Mail`) : null}
        </td>
        <td className={styles.label}>{t(`${I18N_PATH}InvoicePreference`)}</td>
        <td>
          {invoiceConstruction === byOrder
            ? t(`${I18N_PATH}ByOrder`)
            : startCase(invoiceConstruction)}
        </td>
      </tr>
      <tr>
        {invoiceEmails ? (
          <>
            <td className={styles.label}>{t(`${I18N_PATH}InvoiceEmails`)}</td>
            <td>{invoiceEmails.join(', ')}</td>
          </>
        ) : null}
        {
          <>
            <td className={styles.label}>{t(`${I18N_PATH}AutopayType`)}</td>
            <td>{autopayType ? startCase(autopayType) : fallback}</td>
          </>
        }
      </tr>
      <tr>
        {notificationEmails ? (
          <>
            <td className={styles.label}>{t(`${I18N_PATH}NotificationEmails`)}</td>
            <td>{notificationEmails.join(', ')}</td>
          </>
        ) : null}
        {
          <>
            <td className={styles.label}>{t(`${I18N_PATH}AutopayCreditCard`)}</td>
            <td>{creditCardLabel || fallback}</td>
          </>
        }
      </tr>
      <tr>
        {statementEmails ? (
          <>
            <td className={styles.label}>{t(`${I18N_PATH}StatementEmails`)}</td>
            <td>{statementEmails.join(', ')}</td>
          </>
        ) : null}
      </tr>
      <Divider colSpan={4} bottom />
    </>
  );
};

export default observer(AccountSection);
