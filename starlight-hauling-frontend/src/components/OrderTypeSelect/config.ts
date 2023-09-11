import i18next from 'i18next';

import {
  LinkOrderIcon,
  NonServiceOrderIcon,
  OrderIcon,
  RecurrentOrderIcon,
  // RentalOrderIcon,
  SubscriptionIcon,
} from '@root/assets';
import { BusinessLineType, ClientRequestType } from '@root/consts';

import { IOrderType } from './types';

const I18N_PATH = 'components.OrderTypeSelect.Text.';

export const configs: Record<BusinessLineType, Omit<IOrderType, 'onClick'>[]> = {
  [BusinessLineType.rollOff]: [
    {
      icon: OrderIcon,
      title: i18next.t(`${I18N_PATH}RegularOrder`),
      subtitle: i18next.t(`${I18N_PATH}RegularOrderSubtitle`),
      type: ClientRequestType.RegularOrder,
    },
    // {
    //   icon: RentalOrderIcon,
    //   title: 'Rental Order',
    //   subtitle: 'Rent a container on regular base with monthly billing.',
    //   type: ClientRequestType.RentalOrder,
    // },
    {
      icon: RecurrentOrderIcon,
      title: i18next.t(`${I18N_PATH}RecurrentOrder`),
      subtitle: i18next.t(`${I18N_PATH}RecurrentOrderSubtitle`),
      type: ClientRequestType.RecurrentOrder,
    },
    {
      icon: NonServiceOrderIcon,
      title: i18next.t(`${I18N_PATH}NonServiceOrder`),
      subtitle: i18next.t(`${I18N_PATH}NonServiceOrderSubtitle`),
      type: ClientRequestType.NonServiceOrder,
    },
  ],
  [BusinessLineType.commercialWaste]: [
    {
      icon: SubscriptionIcon,
      title: i18next.t(`${I18N_PATH}Subscription`),
      subtitle: i18next.t(`${I18N_PATH}SubscriptionSubtitle`),
      type: ClientRequestType.Subscription,
    },
    {
      icon: LinkOrderIcon,
      title: i18next.t(`${I18N_PATH}LinkOrderNonServiceOrder`),
      subtitle: i18next.t(`${I18N_PATH}LinkOrderNonServiceOrderSubtitle`),
      type: ClientRequestType.SubscriptionOrder,
    },
  ],
  [BusinessLineType.residentialWaste]: [
    {
      icon: SubscriptionIcon,
      title: i18next.t(`${I18N_PATH}Subscription`),
      subtitle: i18next.t(`${I18N_PATH}SubscriptionSubtitle`),
      type: ClientRequestType.Subscription,
    },
    {
      icon: LinkOrderIcon,
      title: i18next.t(`${I18N_PATH}LinkOrderNonServiceOrder`),
      subtitle: i18next.t(`${I18N_PATH}LinkOrderNonServiceOrderSubtitle`),
      type: ClientRequestType.SubscriptionOrder,
    },
  ],
  [BusinessLineType.portableToilets]: [
    {
      icon: OrderIcon,
      title: i18next.t(`${I18N_PATH}RegularOrder`),
      subtitle: i18next.t(`${I18N_PATH}RegularOrderSubtitle`),
      type: ClientRequestType.RegularOrder,
    },
    {
      icon: SubscriptionIcon,
      title: i18next.t(`${I18N_PATH}Subscription`),
      subtitle: i18next.t(`${I18N_PATH}SubscriptionSubtitle`),
      type: ClientRequestType.Subscription,
    },
    {
      icon: LinkOrderIcon,
      title: i18next.t(`${I18N_PATH}LinkOrderNonServiceOrder`),
      subtitle: i18next.t(`${I18N_PATH}LinkOrderNonServiceOrderSubtitle`),
      type: ClientRequestType.SubscriptionOrder,
    },
    {
      icon: NonServiceOrderIcon,
      title: i18next.t(`${I18N_PATH}NonServiceOrder`),
      subtitle: `${I18N_PATH}NonServiceOrderSubtitle`,
      type: ClientRequestType.NonServiceOrder,
    },
  ],
  [BusinessLineType.recycling]: [],
};

export const subscriptionOrdersConfig: Record<
  ClientRequestType.SubscriptionNonService | ClientRequestType.SubscriptionOrder,
  Omit<IOrderType, 'onClick'>
> = {
  [ClientRequestType.SubscriptionNonService]: {
    title: i18next.t(`${I18N_PATH}NonServiceOrder`),
    icon: LinkOrderIcon,
    type: ClientRequestType.SubscriptionNonService,
  },
  [ClientRequestType.SubscriptionOrder]: {
    title: i18next.t(`${I18N_PATH}SubscriptionOrder`),
    icon: LinkOrderIcon,
    type: ClientRequestType.SubscriptionOrder,
  },
};
