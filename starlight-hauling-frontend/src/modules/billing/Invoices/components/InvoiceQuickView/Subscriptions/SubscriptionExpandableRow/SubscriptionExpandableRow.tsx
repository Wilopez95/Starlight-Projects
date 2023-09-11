import React, { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Layouts, Typography, useToggle } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import { TableCell, TableRow } from '../../../../../../../common/TableTools';
import { ArrowIcon } from '../../../../../../../common/TableTools/TableNavigationHeader/styles';
import { useIntl } from '../../../../../../../i18n/useIntl';

import LineItemRow from './LineItemRow/LineItemRow';
import SubscriptionOrderRow from './SubscriptionOrderRow/SubscriptionOrderRow';
import { ISubscriptionExpandableRow } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.Invoices.components.InvoiceQuickView.tabs.Subscriptions.';

const SubscriptionExpandableRow: React.FC<ISubscriptionExpandableRow> = ({
  subscription,
  customer,
}) => {
  const { subscriptionStore } = useStores();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const { formatCurrency, formatDateTime } = useIntl();

  const [toggle, handleToggle] = useToggle(false);
  const handleToggleClick = useCallback(
    (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
      e.stopPropagation();

      return handleToggle();
    },
    [handleToggle],
  );

  return (
    <>
      <TableRow
        className={styles.subscriptionRow}
        onClick={(event: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
          handleToggleClick(event);
          event.preventDefault();
        }}
        selected={toggle}
      >
        <TableCell colSpan={2}>
          <ArrowIcon $active={!toggle} />
          <Layouts.Padding padding="1">
            <Trans
              i18nKey={`${I18N_PATH}Subscription#`}
              values={{ id: subscription.id }}
              components={{
                redirectTo: (
                  <Link
                    to={pathToUrl(Paths.SubscriptionModule.Subscriptions, {
                      businessUnit: businessUnitId,
                      tab: SubscriptionTabRoutes.Active,
                      subscriptionId: subscription.id,
                    })}
                  />
                ),
                id: <Typography as="span" color="information" />,
              }}
            />
          </Layouts.Padding>
        </TableCell>
        <TableCell colSpan={2}>
          <Typography>{subscription?.serviceItems[0]?.serviceName}</Typography>
        </TableCell>
        <TableCell right>
          <Typography>{formatCurrency(subscription.totalPriceForSubscription)}</Typography>
        </TableCell>
      </TableRow>

      {toggle
        ? subscription.serviceItems.map((serviceItem, serviceItemIndex) => (
            <React.Fragment key={`${serviceItem.serviceName}-${serviceItemIndex}`}>
              <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
                <TableCell colSpan={5}>
                  <Typography fontWeight="medium">
                    {t(`${I18N_PATH}Service#`, { id: serviceItemIndex + 1 })}
                  </Typography>
                </TableCell>
              </TableRow>

              {serviceItem.serviceItems.map((concreteServiceItem, concreteServiceItemIndex) => (
                <TableRow
                  className={styles.subscriptionRow}
                  key={`${concreteServiceItem.id}-${concreteServiceItemIndex}`}
                >
                  <TableCell>
                    <Layouts.Padding left="2">
                      <Typography>
                        {`${formatDateTime(concreteServiceItem.periodSince).date} - ${
                          formatDateTime(concreteServiceItem.periodTo).date
                        }`}
                      </Typography>
                    </Layouts.Padding>
                  </TableCell>

                  <TableCell>
                    <Typography>{serviceItem.serviceName}</Typography>
                  </TableCell>

                  <TableCell right>
                    <Typography>{formatCurrency(concreteServiceItem.price)}</Typography>
                  </TableCell>

                  <TableCell right>
                    <Typography>{concreteServiceItem.quantity}</Typography>
                  </TableCell>

                  <TableCell right>
                    <Typography>{formatCurrency(concreteServiceItem.totalPrice)}</Typography>
                  </TableCell>
                </TableRow>
              ))}

              {serviceItem.lineItems.length > 0 ? (
                <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
                  <TableCell colSpan={5}>
                    <Layouts.Padding left="2">
                      <Typography fontWeight="medium">{t(`${I18N_PATH}LineItems`)}</Typography>
                    </Layouts.Padding>
                  </TableCell>
                </TableRow>
              ) : null}
              {serviceItem.lineItems.map((lineItem, lineItemIndex) => (
                <LineItemRow lineItem={lineItem} key={`${lineItem.id}-${lineItemIndex}`} />
              ))}
              {serviceItem.subscriptionOrders.map((subscriptionOrder, subscriptionOrderIndex) => (
                <React.Fragment key={`${subscriptionOrder.id}-${subscriptionOrderIndex}`}>
                  <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
                    <TableCell colSpan={5}>
                      <Layouts.Padding left="2">
                        <Trans
                          i18nKey={`${I18N_PATH}SubscriptionOrder#`}
                          values={{ id: subscriptionOrder.sequenceId }}
                          components={{
                            redirectTo: (
                              <Link
                                to={pathToUrl(Paths.CustomerSubscriptionModule.OrderDetails, {
                                  businessUnit: businessUnitId,
                                  subscriptionId: subscription.id,
                                  customerId: customer?.id,
                                  tab:
                                    subscriptionStore?.selectedEntity?.status ??
                                    SubscriptionTabRoutes.Active,
                                  subscriptionOrderId: subscriptionOrder.id,
                                })}
                              />
                            ),
                            id: <Typography as="span" fontWeight="medium" color="information" />,
                          }}
                        />
                      </Layouts.Padding>
                    </TableCell>
                  </TableRow>
                  <SubscriptionOrderRow subscriptionOrder={subscriptionOrder} />
                </React.Fragment>
              ))}
            </React.Fragment>
          ))
        : null}

      {toggle
        ? subscription.linkedSubscriptionOrder?.map((subscriptionOrder, index) => (
            <React.Fragment key={`${subscriptionOrder.id}-${index}`}>
              <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
                <TableCell colSpan={5}>
                  <Trans
                    i18nKey={`${I18N_PATH}SubscriptionOrder#`}
                    values={{ id: subscriptionOrder.sequenceId }}
                    components={{
                      redirectTo: (
                        <Link
                          to={pathToUrl(Paths.CustomerSubscriptionModule.OrderDetails, {
                            businessUnit: businessUnitId,
                            subscriptionId: subscription.id,
                            customerId: customer?.id,
                            tab:
                              subscriptionStore?.selectedEntity?.status ??
                              SubscriptionTabRoutes.Active,
                            subscriptionOrderId: subscriptionOrder.id,
                          })}
                        />
                      ),
                      id: <Typography as="span" fontWeight="medium" color="information" />,
                    }}
                  />
                </TableCell>
              </TableRow>
              <SubscriptionOrderRow subscriptionOrder={subscriptionOrder} />
            </React.Fragment>
          ))
        : null}

      {toggle
        ? subscription.nonServiceOrder?.map((nonServiceOrder, index) => (
            <React.Fragment key={`${nonServiceOrder.id}-${index}`}>
              <TableRow className={cx(styles.subscriptionRow, styles.titleRow)}>
                <TableCell colSpan={5}>
                  <Trans
                    i18nKey={`${I18N_PATH}NonServiceOrder#`}
                    values={{ id: nonServiceOrder.sequenceId }}
                    components={{
                      redirectTo: (
                        <Link
                          to={pathToUrl(Paths.CustomerSubscriptionModule.OrderDetails, {
                            businessUnit: businessUnitId,
                            subscriptionId: subscription.id,
                            customerId: customer?.id,
                            tab:
                              subscriptionStore?.selectedEntity?.status ??
                              SubscriptionTabRoutes.Active,
                            subscriptionOrderId: nonServiceOrder.id,
                          })}
                        />
                      ),
                      id: <Typography as="span" fontWeight="medium" color="information" />,
                    }}
                  />
                </TableCell>
              </TableRow>

              {nonServiceOrder.subOrderLineItems?.map((item, indexNumber) => (
                <LineItemRow
                  key={`${item.id}-${indexNumber}`}
                  lineItem={{
                    ...item,
                    serviceDate: nonServiceOrder.serviceDate,
                    totalPrice: item.price * item.quantity,
                  }}
                />
              ))}
            </React.Fragment>
          ))
        : null}
    </>
  );
};

export default observer(SubscriptionExpandableRow);
