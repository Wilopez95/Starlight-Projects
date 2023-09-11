import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';

import { useIntl } from '@root/i18n/useIntl';

import { ArrowLeftIcon } from '../../../../../../../assets';
import { Typography } from '../../../../../../../common';
import { mapCustomerToNavItem } from '../../helpers';
import { type FormikInvoicingData, GenerateInvoicingMode } from '../../types';
import styles from './css/styles.scss';

interface IInvoicingSidebar {
  loading?: boolean;
  backText?: string;
  mode?: GenerateInvoicingMode;
  onClose(): void;
}

interface LoadingInvoicingSidebar extends IInvoicingSidebar {
  loading: true;
  defaultOrdersCount: number;
  defaultSubscriptionsCount: number;
}

interface LoadedInvoicingSidebar extends IInvoicingSidebar, FormikInvoicingData {
  loading?: false;
  currentCustomer?: NavigationConfigItem;
  onCustomerChange(navItem: ReturnType<typeof mapCustomerToNavItem>): void;
}

type SidebarProps = LoadingInvoicingSidebar | LoadedInvoicingSidebar;

const fallback = '-';
const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const InvoicingSidebar: React.FC<SidebarProps> = props => {
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  return (
    <Layouts.Flex direction="column" as={Layouts.Scroll} className={styles.sidebar}>
      <div className={styles.header}>
        <Typography color="information" className={styles.backLink} onClick={props.onClose}>
          <ArrowLeftIcon /> {props.backText ?? 'Back to Invoicing Options'}
        </Typography>
        <h2 className={styles.heading}>
          {props.loading ? t(`${I18NPath}GeneratingInvoices`) : t(`${I18NPath}GeneratedInvoices`)}
        </h2>
      </div>
      <div className={styles.customers}>
        {!props.loading ? (
          <>
            {props.onAccount.length > 0 ? (
              <>
                <Typography color="secondary" className={styles.subHeading}>
                  {t(`${I18NPath}OnAccount`)}
                </Typography>
                <Layouts.Scroll>
                  <Navigation
                    activeTab={props.currentCustomer}
                    configs={props.onAccount.map(mapCustomerToNavItem)}
                    onChange={props.onCustomerChange}
                    direction="column"
                  />
                </Layouts.Scroll>
              </>
            ) : null}

            {props.prepaid.length > 0 ? (
              <>
                <Typography color="secondary" className={styles.subHeading}>
                  {t(`${I18NPath}Prepaid`)}
                </Typography>
                <Layouts.Scroll>
                  <Navigation
                    activeTab={props.currentCustomer}
                    configs={props.prepaid.map(mapCustomerToNavItem)}
                    onChange={props.onCustomerChange}
                    direction="column"
                  />
                </Layouts.Scroll>
              </>
            ) : null}
          </>
        ) : null}
      </div>
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <Typography variant="headerFive" color="secondary">
            {t(`${I18NPath}ProcessedOrders`)}:
          </Typography>
          <Typography>
            {props.loading ? props.defaultOrdersCount : props.processedOrders}
          </Typography>
        </div>
        {props.mode === GenerateInvoicingMode.OrdersAndSubscriptions ? (
          <div className={styles.summaryItem}>
            <Typography variant="headerFive" color="secondary">
              {t(`${I18NPath}ProcessedSubscriptions`)}:
            </Typography>
            <Typography>
              {props.loading ? props.defaultSubscriptionsCount : props.processedSubscriptions}
            </Typography>
          </div>
        ) : null}
        <div className={styles.summaryItem}>
          <Typography variant="headerFive" color="secondary">
            {t(`${I18NPath}CustomersIncluded`)}:
          </Typography>
          <Typography>{props.loading ? fallback : props.customersCount}</Typography>
        </div>
        <div className={styles.summaryItem}>
          <Typography variant="headerFive" color="secondary">
            {t(`${I18NPath}GeneratedInvoices`)}:
          </Typography>
          <Typography>{props.loading ? fallback : props.generatedInvoices}</Typography>
        </div>
        <div className={styles.summaryItem}>
          <Typography variant="headerFive" color="secondary" fontWeight="bold">
            {t(`${I18NPath}InvoicesTotal`)}:
          </Typography>
          <Typography fontWeight="bold">
            {props.loading ? fallback : formatCurrency(props.invoicesTotal)}
          </Typography>
        </div>
      </div>
    </Layouts.Flex>
  );
};

export default InvoicingSidebar;
