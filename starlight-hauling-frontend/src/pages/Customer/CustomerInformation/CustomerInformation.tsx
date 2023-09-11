import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Badge, Loadable, Typography } from '@root/common';
import { Table } from '@root/common/TableTools';
import { CustomerStatus, Paths } from '@root/consts';
import { handleEnterOrSpaceKeyDown, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { BalanceCell, BalanceRow } from './styles';
import { useCustomerBalancesConfig } from './useCustomerBalancesConfig';

import styles from './css/styles.scss';

const CustomerInformation: React.FC = () => {
  const { customerStore, invoiceStore } = useStores();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();
  const history = useHistory();
  const customer = customerStore.selectedEntity;

  const balanceItemsConfig = useCustomerBalancesConfig(customer);
  const { businessUnitId } = useBusinessContext();

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

  return (
    <div className={styles.header}>
      {customer ? (
        <div>
          <h1 className={styles.name}>{customer.name}</h1>
          <Layouts.Flex className={styles.label}>
            {customer.customerGroup?.description}・ID {customer.id}
            <Layouts.Margin left="2">
              {customer.status !== CustomerStatus.active ? (
                <Badge color="alert">
                  {t(`Text.${customer.status === CustomerStatus.onHold ? 'OnHold' : 'Inactive'}`)}
                </Badge>
              ) : (
                <Badge color="success">{t('Text.Active')}</Badge>
              )}
            </Layouts.Margin>
          </Layouts.Flex>
          <div className={styles.address}>{customer.formattedBillingAddress}</div>
        </div>
      ) : (
        <div>
          <Loadable tag="div" className={styles.name} width={500} />
          <Loadable tag="div" className={styles.label} />
          <Loadable tag="div" className={styles.address} />
        </div>
      )}
      {!customer?.walkup ? (
        <Layouts.Box width="250px">
          <Table>
            <tbody>
              {balanceItemsConfig.map(
                ({ key, label, value, highlightNegativeValue, loading, hasNavigation }) => (
                  <BalanceRow key={key}>
                    <BalanceCell>
                      {hasNavigation ? (
                        <Typography
                          variant="bodyMedium"
                          color="secondary"
                          shade="light"
                          textAlign="right"
                          role="button"
                          tabIndex={0}
                          onClick={handleRedirect}
                          onKeyDown={e => handleKeyDown(e, handleRedirect)}
                        >
                          {label}:
                        </Typography>
                      ) : (
                        <Typography
                          variant="bodyMedium"
                          color="secondary"
                          shade="light"
                          textAlign="right"
                        >
                          {label}:
                        </Typography>
                      )}
                    </BalanceCell>
                    <BalanceCell>
                      {loading ? (
                        <Loadable tag="div" width="80px" />
                      ) : (
                        <>
                          {hasNavigation ? (
                            <Typography
                              textAlign="right"
                              variant="bodyMedium"
                              color={highlightNegativeValue ? 'alert' : 'default'}
                              role="button"
                              tabIndex={0}
                              onClick={handleRedirect}
                              onKeyDown={e => handleKeyDown(e, handleRedirect)}
                            >
                              {formatCurrency(value)}
                            </Typography>
                          ) : (
                            <Typography
                              textAlign="right"
                              variant="bodyMedium"
                              color={highlightNegativeValue ? 'alert' : 'default'}
                            >
                              {formatCurrency(value)}
                            </Typography>
                          )}
                        </>
                      )}
                    </BalanceCell>
                  </BalanceRow>
                ),
              )}
            </tbody>
          </Table>
        </Layouts.Box>
      ) : null}
    </div>
  );
};

export default observer(CustomerInformation);
