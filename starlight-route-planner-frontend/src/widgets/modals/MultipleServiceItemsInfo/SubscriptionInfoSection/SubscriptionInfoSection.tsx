import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InNewWindowIcon,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Typography,
} from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Paths } from '@root/consts';
import { formatAddress, getHaulingRedirectUrl, pathToUrl } from '@root/helpers';
import { useBusinessContext, useDateTime, useStores } from '@root/hooks';
import { IHaulingServiceItem } from '@root/types';

import * as Styles from '../styles';

import ServiceItemInfoSection from './ServiceItemInfoSection/ServiceItemInfoSection';

interface IProps {
  subscriptionId: number;
  subscriptionServiceItems: IHaulingServiceItem[];
}

const I18N_PATH = 'components.modals.Popup.';
const I18N_ROOT_PATH = 'Text.';

export const SubscriptionInfoSection: React.FC<IProps> = observer(
  ({ subscriptionId, subscriptionServiceItems }) => {
    const { formatDateTime } = useDateTime();
    const { businessUnitId } = useBusinessContext();
    const { t } = useTranslation();
    const { customerStore, businessLineStore } = useStores();

    const haulingServiceItemHelper = subscriptionServiceItems[0];
    const { startDate, endDate, customerId, jobSite, businessLineId } = haulingServiceItemHelper;

    const businessLine = businessLineStore.getById(businessLineId);

    useEffect(() => {
      if (!customerId) {
        return;
      }

      customerStore.requestById(customerId);
    }, [customerId, customerStore]);

    const customerName = useMemo(() => {
      if (!customerStore.currentCustomer) {
        return '';
      }

      const { name, firstName = '', lastName = '' } = customerStore.currentCustomer;

      return name || `${firstName} ${lastName}`;
    }, [customerStore.currentCustomer]);

    const generateRedirectLink = useMemo(() => {
      if (!subscriptionId || !customerId) {
        return undefined;
      }

      const getRedirectUrl = getHaulingRedirectUrl(window.location.hostname);

      const url = getRedirectUrl(
        pathToUrl(Paths.CustomerSubscriptionModule.Details, {
          businessUnit: businessUnitId,
          customerId,
          tab: 'active',
          id: subscriptionId,
        }),
      );

      return url;
    }, [businessUnitId, customerId, subscriptionId]);

    const renderPeriod = useMemo(() => {
      if (!endDate) {
        const date = formatDateTime({
          from: startDate ? new Date(startDate) : undefined,
          format: 'dateDefault',
          defaultValue: '-',
        });

        return `From ${date}`;
      }

      const _startDate = formatDateTime({
        from: startDate ? new Date(startDate) : undefined,
        format: 'dateDefault',
        defaultValue: '-',
      });
      const _endDate = formatDateTime({ from: new Date(endDate), format: 'dateDefault' });
      return `${_startDate} to ${_endDate}`;
    }, [startDate, endDate, formatDateTime]);

    const [selectedServiceItem, setSelectedServiceItem] = useState<IHaulingServiceItem>(
      subscriptionServiceItems[0],
    );

    const serviceItemTabsConfig: NavigationConfigItem[] = useMemo(() => {
      return subscriptionServiceItems.map((subscriptionServiceItem, index) => {
        const allDays = Object.values(
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          subscriptionServiceItem.serviceDaysOfWeek
            ? subscriptionServiceItem.serviceDaysOfWeek
            : {},
        ).map(day => day.route);
        const assignedDays = allDays.filter(Boolean);

        return {
          label: (
            <>
              {subscriptionId}.{subscriptionServiceItem.id}{' '}
              {allDays.length !== assignedDays.length && (
                <Styles.TabTitleMark color="alert" shade="standard" as="span" variant="headerOne">
                  &#183;
                </Styles.TabTitleMark>
              )}
            </>
          ),
          key: `${subscriptionServiceItem.id}`,
          index,
        };
      });
    }, [subscriptionId, subscriptionServiceItems]);

    const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(serviceItemTabsConfig[0]);

    const handleTabChange = (tab: NavigationConfigItem) => {
      setCurrentTab(tab);
      setSelectedServiceItem(subscriptionServiceItems[tab.index]);
    };

    useEffect(() => {
      setCurrentTab(serviceItemTabsConfig[0]);
      setSelectedServiceItem(subscriptionServiceItems[0]);
    }, [serviceItemTabsConfig, subscriptionServiceItems, setCurrentTab, setSelectedServiceItem]);

    return (
      <>
        <Typography variant="headerFive" color="default" shade="dark">
          {t(`${I18N_PATH}Title`, { id: subscriptionId })}
        </Typography>
        <Layouts.Margin top="1" />
        <Layouts.Grid columns="160px auto" rowGap="0.5">
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}Period`)}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {renderPeriod}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}Customer`)}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {customerName}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}JobSite`)}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {jobSite.name ? jobSite.name : formatAddress(jobSite.address)}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}LineOfBusiness`)}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="dark">
            {businessLine?.name}
          </Typography>
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_ROOT_PATH}Subscription#`)}
          </Typography>
          <Layouts.Flex>
            <Styles.Link href={generateRedirectLink} target="_blank">
              {subscriptionId}
            </Styles.Link>
            <Layouts.Margin right="0.5" />
            <InNewWindowIcon />
          </Layouts.Flex>
        </Layouts.Grid>
        <Layouts.Margin top="1" />
        <Typography variant="headerFive" color="default" shade="dark">
          {t(`${I18N_PATH}Services`, {
            services: subscriptionServiceItems.length,
          })}
        </Typography>
        <Navigation
          activeTab={currentTab}
          configs={serviceItemTabsConfig}
          onChange={handleTabChange}
          border
          withEmpty
          carousel
        />
        <ServiceItemInfoSection serviceItem={selectedServiceItem} />
      </>
    );
  },
);
