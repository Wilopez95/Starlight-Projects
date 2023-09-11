import React, { useEffect, useMemo, useState } from 'react';
import { Layouts, NavigationConfigItem } from '@starlightpro/shared-components';
import { groupBy } from 'lodash-es';

import { useStores } from '@root/hooks';
import { IHaulingServiceItem } from '@root/types';

import { SubscriptionInfoSection } from './SubscriptionInfoSection/SubscriptionInfoSection';
import * as Styles from './styles';

interface IProps {
  serviceItemsIds: number[];
  onClose(): void;
}

export const MultipleServiceItemsInfoModal: React.FC<IProps> = ({ serviceItemsIds, onClose }) => {
  const { haulingServiceItemStore } = useStores();

  const filteredServiceItems = useMemo(() => {
    return haulingServiceItemStore.values.filter(item => serviceItemsIds.includes(item.id));
  }, [haulingServiceItemStore, serviceItemsIds]);

  const serviceItemsBySubscription = useMemo(() => {
    return groupBy(filteredServiceItems, item => item.subscription.id);
  }, [filteredServiceItems]);

  const subscriptionIds = useMemo(() => {
    return Object.keys(serviceItemsBySubscription);
  }, [serviceItemsBySubscription]);

  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [subscriptionServiceItems, setSubscriptionServiceItems] = useState<
    IHaulingServiceItem[] | null
  >(null);

  const subscriptionTabsConfig: NavigationConfigItem[] = useMemo(() => {
    return subscriptionIds.map((id, index) => {
      const serviceItems = serviceItemsBySubscription[id];
      const allRoutes = serviceItems
        .flatMap(service =>
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          Object.values(service.serviceDaysOfWeek ? service.serviceDaysOfWeek : {}),
        )
        .map(day => day.route);
      const assignedRoutes = allRoutes.filter(Boolean);

      return {
        label: (
          <>
            #{id}{' '}
            {allRoutes.length !== assignedRoutes.length && (
              <Styles.TabTitleMark color="alert" shade="standard" as="span" variant="headerOne">
                &#183;
              </Styles.TabTitleMark>
            )}
          </>
        ),
        key: `${id}`,
        index,
      };
    });
  }, [serviceItemsBySubscription, subscriptionIds]);
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(subscriptionTabsConfig[0]);

  const handleTabChange = (tab: NavigationConfigItem) => {
    setCurrentTab(tab);
    setSubscriptionId(+subscriptionIds[tab.index]);
    setSubscriptionServiceItems(serviceItemsBySubscription[subscriptionIds[tab.index]]);
  };

  useEffect(() => {
    setSubscriptionId(+subscriptionIds[0]);
  }, [setSubscriptionId, subscriptionIds]);

  useEffect(() => {
    if (subscriptionId) {
      setSubscriptionServiceItems(serviceItemsBySubscription[subscriptionId]);
    }
  }, [subscriptionId, serviceItemsBySubscription, setSubscriptionServiceItems]);

  return (
    <Layouts.Flex>
      {subscriptionIds.length > 1 && (
        <Layouts.Flex>
          <Layouts.Scroll maxHeight={442}>
            <Styles.VerticalNavigation
              activeTab={currentTab}
              configs={subscriptionTabsConfig}
              onChange={handleTabChange}
              direction="column"
              border
            />
          </Layouts.Scroll>
        </Layouts.Flex>
      )}
      <Styles.PopupContentWrapper position="relative" backgroundColor="white">
        <Layouts.Padding padding="3">
          <Styles.CrossIcon onClick={onClose} role="button" aria-label="close" />
          {subscriptionId && subscriptionServiceItems && (
            <SubscriptionInfoSection
              subscriptionId={subscriptionId}
              subscriptionServiceItems={subscriptionServiceItems}
            />
          )}
        </Layouts.Padding>
      </Styles.PopupContentWrapper>
    </Layouts.Flex>
  );
};
