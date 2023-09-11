import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { Paths } from '@root/consts';
import { handleEnterOrSpaceKeyDown, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { useCustomerBalancesConfig } from '@root/pages/Customer/CustomerInformation/useCustomerBalancesConfig';

import { LinkedItems } from './LinkedItems/LinkedItems';
import {
  CustomerQuickViewNavigation,
  customerQuickViewNavigationConfigs,
} from './navigationConfig';

import styles from './css/styles.scss';

const requestLimit = 3;

const cellFallback = '-';

const I18N_PATH = 'quickViews.CustomerProfileQuickView.CustomerQuickViewRightPanel.';

const CustomerQuickViewRightPanel: React.FC<{ customerDetailsLink: string }> = ({
  customerDetailsLink,
}) => {
  const { customerStore, jobSiteStore, projectStore, invoiceStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const { t } = useTranslation();
  const history = useHistory();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<CustomerQuickViewNavigation>>(
    customerQuickViewNavigationConfigs[0],
  );

  const customer = customerStore.selectedEntity;
  const balancesConfigs = useCustomerBalancesConfig(customer);
  const balancesIncluded = ['balance', 'availableCredit'];

  const { businessUnitId } = useBusinessContext();

  useEffect(() => {
    projectStore.cleanup();
    jobSiteStore.cleanup();

    if (customer) {
      jobSiteStore.requestByCustomer({
        customerId: customer.id,
        limit: requestLimit,
        mostRecent: true,
      });
      projectStore.requestByCustomer({
        customerId: customer.id,
        limit: requestLimit,
        mostRecent: true,
      });
    }
  }, [customer, jobSiteStore, projectStore]);

  useEffect(() => {
    return () => customerStore.toggleQuickView(false);
  }, [customerStore]);

  const handleRedirect = useCallback(() => {
    const customerInvoicesUrl = pathToUrl(Paths.CustomerModule.Invoices, {
      businessUnit: businessUnitId,
      customerId: customer?.id,
    });

    invoiceStore.setSort('STATUS', 'asc');
    history.push(customerInvoicesUrl);
  }, [businessUnitId, customer?.id, invoiceStore, history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  if (!customer) {
    return null;
  }

  const time = formatDateTime(customer.createdAt as Date, { timeZone: localTimeZone }).time;
  const date = formatDateTime(customer.createdAt as Date).date;

  const isWalkup = customer?.walkup;

  return (
    <>
      <Layouts.Padding left="3" right="3" top="3">
        <div className={tableQuickViewStyles.dataContainer}>
          <div className={tableQuickViewStyles.quickViewTitle}>
            <Link to={customerDetailsLink}>
              <Typography color="information" textTransform="capitalize" fontWeight="medium">
                {customer.name}
              </Typography>
            </Link>
          </div>

          <div className={tableQuickViewStyles.quickViewDescription}>
            {customer.customerGroup?.description} ・ ID {customer.id}
            {customer.alternateId ? `・ ALT ID ${customer.alternateId}` : null}
          </div>
        </div>
        <Divider top />
      </Layouts.Padding>
      <Layouts.Scroll rounded>
        <Layouts.Padding padding="3">
          <Table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.td}>
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}Created`)}
                  </Typography>
                </td>
                <td>
                  {time} ・{' '}
                  <Typography as="span" variant="bodyMedium" color="secondary" shade="desaturated">
                    {date}
                  </Typography>
                </td>
              </tr>
              <tr>
                <td>
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}MainContact`)}
                  </Typography>
                </td>
                <td>{!isWalkup ? customer.contactPerson : cellFallback}</td>
              </tr>
              <tr>
                <td>
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}PhoneNumber`)}
                  </Typography>
                </td>
                <td>
                  {customer.phone && !isWalkup ? (
                    <>
                      <a href={`tel:${customer.phone.number}`}>
                        <Typography
                          as="span"
                          variant="bodyMedium"
                          color="information"
                          cursor="pointer"
                        >
                          {customer.phone.number}
                        </Typography>
                      </a>

                      {customer.phone.extension ? (
                        <>
                          <Typography
                            as="span"
                            color="secondary"
                            shade="desaturated"
                            variant="bodyMedium"
                          >
                            {' '}
                            / ext{' '}
                          </Typography>
                          {customer.phone.extension}
                        </>
                      ) : null}
                    </>
                  ) : (
                    cellFallback
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}BillingAddress`)}
                  </Typography>
                </td>
                <td>{!customer.walkup ? customer.formattedBillingAddress : cellFallback}</td>
              </tr>
              {balancesConfigs
                .filter(item => balancesIncluded.includes(item.key))
                .map(({ key, label, value, highlightNegativeValue, hasNavigation }) => (
                  <tr key={key}>
                    <td>
                      {hasNavigation ? (
                        <Typography
                          variant="bodyMedium"
                          color="secondary"
                          shade="desaturated"
                          role="button"
                          tabIndex={0}
                          onClick={handleRedirect}
                          onKeyDown={e => handleKeyDown(e, handleRedirect)}
                        >
                          {label}, $
                        </Typography>
                      ) : (
                        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                          {label}, $
                        </Typography>
                      )}
                    </td>
                    <td>
                      {hasNavigation ? (
                        <Typography
                          textAlign="left"
                          variant="bodyMedium"
                          color={highlightNegativeValue ? 'alert' : 'default'}
                          role="button"
                          tabIndex={0}
                          onClick={handleRedirect}
                          onKeyDown={e => handleKeyDown(e, handleRedirect)}
                        >
                          {!isWalkup ? formatCurrency(value) : cellFallback}
                        </Typography>
                      ) : (
                        <Typography
                          textAlign="left"
                          variant="bodyMedium"
                          color={highlightNegativeValue ? 'alert' : 'default'}
                        >
                          {!isWalkup ? formatCurrency(value) : cellFallback}
                        </Typography>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
          {!isWalkup ? (
            <>
              <Layouts.Margin top="4">
                <Navigation
                  activeTab={currentTab}
                  configs={customerQuickViewNavigationConfigs}
                  onChange={setCurrentTab}
                  border
                  withEmpty
                />
              </Layouts.Margin>
              <LinkedItems tab={currentTab.key} />
            </>
          ) : null}
          <Divider bottom />
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}CustomerNote`)}
          </Typography>
          <Layouts.Padding top="0.5">{customer.generalNote}</Layouts.Padding>
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};

export default observer(CustomerQuickViewRightPanel);
