import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';

import { useBusinessContext } from '@hooks';

import { Typography } from '../../../../../../../../common';
import { Paths } from '../../../../../../../../consts';
import { pathToUrl, substituteLocalTimeZoneInsteadUTC } from '../../../../../../../../helpers';
import { useIntl } from '../../../../../../../../i18n/useIntl';
import { IInvoicingSubscriptions } from '../../../../../../../../types';
import { ReservedServiceNames } from '../../../../../types';
import { IDraftSubscriptionRow } from '../types';

const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const DraftSubscriptionRow: React.FC<IDraftSubscriptionRow> = ({
  currentCustomerId,
  subscription,
}) => {
  const { businessUnitId } = useBusinessContext();
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();

  const { services, notServicePrice } = useMemo<{
    services: IInvoicingSubscriptions['summaryPerServiceItem'];
    notServicePrice: number;
  }>(() => {
    const servicesData: IInvoicingSubscriptions['summaryPerServiceItem'] = [];
    let notServicePriceData = 0;

    subscription.summaryPerServiceItem.forEach(serviceItem => {
      if (serviceItem.serviceName === ReservedServiceNames.notService) {
        notServicePriceData += serviceItem.price;
      } else {
        servicesData.push(serviceItem);
      }
    });

    return {
      services: servicesData,
      notServicePrice: notServicePriceData,
    };
  }, [subscription.summaryPerServiceItem]);

  return (
    <>
      {services.map((serviceItem, serviceIndex, serviceItemsFiltered) => (
        <tr key={`${subscription.id}-${serviceItem.serviceItemId}-${serviceIndex}`}>
          {serviceIndex === 0 ? (
            <>
              <td rowSpan={serviceItemsFiltered.length} valign="top">
                <Link
                  replace
                  target="_blank"
                  to={pathToUrl(Paths.CustomerSubscriptionModule.Details, {
                    businessUnit: businessUnitId,
                    customerId: currentCustomerId,
                    subscriptionId: subscription.id,
                    tab: subscription.status,
                  })}
                >
                  <Typography textAlign="left" color="information" cursor="pointer">
                    {subscription.id}
                  </Typography>
                </Link>
              </td>
              <td rowSpan={serviceItemsFiltered.length} valign="top">
                <Typography textAlign="left">
                  {
                    formatDateTime(
                      substituteLocalTimeZoneInsteadUTC(subscription.nextBillingPeriodFrom),
                    ).date
                  }{' '}
                  -{' '}
                  {
                    formatDateTime(
                      substituteLocalTimeZoneInsteadUTC(subscription.nextBillingPeriodTo),
                    ).date
                  }
                </Typography>
              </td>
            </>
          ) : null}
          <td>
            <Typography as={Layouts.Box} textAlign="left">
              {serviceItem.serviceName}
            </Typography>
          </td>
          <td>
            <Typography textAlign="right">{formatCurrency(serviceItem.price)}</Typography>
          </td>
        </tr>
      ))}
      {notServicePrice > 0 ? (
        <tr>
          <td colSpan={2} />
          <td>{t(`${I18NPath}NonServiceOrders`)}</td>
          <td>
            <Typography textAlign="right">{formatCurrency(notServicePrice)}</Typography>
          </td>
        </tr>
      ) : null}
    </>
  );
};

export default DraftSubscriptionRow;
