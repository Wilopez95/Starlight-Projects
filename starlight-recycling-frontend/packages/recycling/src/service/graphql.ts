import { createApolloClient, getServiceInfo, showForbidden } from '@starlightpro/common';
import { ApolloClientOptions } from '@starlightpro/common/service/graphql';
import { getLocalStorageAuthData } from '@starlightpro/common/service/utils';

import { LOCAL_STORAGE_USER_KEY } from '../constants';
import { resolvers, typeDefs } from '../graphql';

//TODO: You can redefine these types to more verbose
const initCache = () => {};

export const clientConfig: ApolloClientOptions = {
  resolvers,
  typeDefs,
  getInitialUserInfo: () => {
    return getLocalStorageAuthData(LOCAL_STORAGE_USER_KEY);
  },
  onLogOut: () => {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);

    const { host, protocol, pathname } = window.location;
    const serviceInfo = getServiceInfo();

    if (pathname.indexOf('/login') > 0 || pathname.indexOf('/finish-login') > 0) {
      // if on login page, no need to redirect to login again
      return;
    }

    if (serviceInfo) {
      const { platformAccount, service, serviceAccount } = serviceInfo;
      // TODO figure out where to redirect in case of 401
      const basepath = `/${platformAccount}/${service}/${serviceAccount}`;

      let target = `${protocol}//${host}${basepath}/login`;

      if (window.location.href.indexOf(target) === -1) {
        window.location.href = target;

        return;
      }
    }
  },
  onForbidden: showForbidden,
  onCacheInit: initCache,
  cacheConfig: {
    typePolicies: {
      OrderBillableItem: {
        keyFields: false,
      },
      Price: {
        keyFields: false,
      },
      PriceBasedOnMaterials: {
        keyFields: false,
      },
      BasedOnMaterialsPrices: {
        keyFields: false,
      },
      UserServiceAccount: {
        keyFields: false,
      },
      RoleServiceAccount: {
        keyFields: false,
      },
      CompiledPermission: {
        keyFields: false,
      },
      UserCompiledPermission: {
        keyFields: false,
      },
      Phone: {
        keyFields: false,
      },
      Tax: {
        keyFields: false,
      },
      BasedOnMaterialsTaxes: {
        keyFields: false,
      },
      OrderTotalByStatus: {
        keyFields: false,
      },
      AvailableResourceLogin: {
        keyFields: false,
      },
      CalculatedTax: {
        keyFields: false,
      },
      LineItemTax: {
        keyFields: false,
      },
      TaxBusinessConfiguration: {
        keyFields: false,
      },
      HaulingTaxDistrict: {
        keyFields: false,
      },
      NonGroupTaxValue: {
        keyFields: false,
      },
      LineItemExclusions: {
        keyFields: false,
      },
      NonGroupLineItemTaxValue: {
        keyFields: false,
      },
    },
  },
};

export const client = createApolloClient(clientConfig);
