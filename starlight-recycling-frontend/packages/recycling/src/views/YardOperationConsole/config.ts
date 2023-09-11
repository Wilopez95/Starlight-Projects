import { compact } from 'lodash-es';
import { isEmpty } from 'lodash/fp';
import moment from 'moment';
import {
  GetFilterByFieldFuncType,
  getSearchBody,
  GetSortFuncFilterType,
} from '../../components/Filter/util';
import { OrderStatus, OrderType, SortInput } from '../../graphql/api';
import { ORDERS_PER_PAGE } from '../OrdersView';
import { orderStatuses } from '../OrdersView/constant';
import {
  inYardAndOnTheWaySearchFields,
  todaySearchFields,
  YardOperationConsoleTabs,
} from './constants';

export const getOrdersFilterByField: GetFilterByFieldFuncType = (field, value) => {
  if (isEmpty(value)) {
    return undefined;
  }
  switch (field) {
    case 'type':
    case 'owner':
    case 'paymentMethod':
    case 'PONumber':
    case 'status':
    case 'customerTruck.type':
      return {
        terms: {
          [`${field}.keyword`]: value,
        },
      };
    case 'graded':
      return {
        term: {
          [field]: value[0] === 'true',
        },
      };
    default:
      return {
        terms: {
          [field]: value,
        },
      };
  }
};

interface BuildFetchVariables {
  perPage: number;
  currentSort: SortInput[];
  filter: { field: string; value: any }[];
  query: string | null;
  activeTab: YardOperationConsoleTabs;
}

export const buildFetchVariables = ({
  currentSort,
  perPage = ORDERS_PER_PAGE,
  query,
  filter,
  activeTab,
}: BuildFetchVariables) => {
  let mustNot;
  const filterOptions = [...filter].filter((option) => {
    if (option.field === 'status' && option.value === 'inProgress') {
      mustNot = [
        {
          terms: {
            'status.keyword': orderStatuses.map((status) => status),
          },
        },
      ];

      return false;
    }

    return true;
  });

  const {
    query: {
      bool: { must, filter: searchBodyFilter },
    },
    ...rest
  } = getSearchBody({
    perPage,
    currentSort,
    query,
    filter: filterOptions,
    getSort: getOrdersSort,
    getFilterByField: getOrdersFilterByField,
    fields:
      activeTab === YardOperationConsoleTabs.Today
        ? todaySearchFields
        : inYardAndOnTheWaySearchFields,
  });
  const startOfDay = moment().startOf('day').format();
  const aggregation = {
    time: startOfDay,
    query: {
      bool: {
        must,
        filter: searchBodyFilter,
        must_not: mustNot,
      },
    },
    activeTab,
  };

  if (activeTab === YardOperationConsoleTabs.InYard) {
    return {
      search: {
        ...rest,
        query: {
          bool: {
            must,
            filter: searchBodyFilter,
            must_not: compact([
              {
                exists: {
                  field: 'departureAt',
                },
              },
              {
                term: {
                  'type.keyword': OrderType.NonService,
                },
              },
              {
                term: {
                  'status.keyword': OrderStatus.OnTheWay,
                },
              },
              ...(mustNot || []),
            ]),
          },
        },
      },
      aggregation,
    };
  }

  if (activeTab === YardOperationConsoleTabs.OnTheWay) {
    return {
      search: {
        ...rest,
        query: {
          bool: {
            filter: searchBodyFilter,
            must: compact([
              {
                term: { 'status.keyword': OrderStatus.OnTheWay },
              },
              ...(must || []),
            ]),
            must_not: compact([
              {
                term: {
                  'type.keyword': OrderType.NonService,
                },
              },
              ...(mustNot || []),
            ]),
          },
        },
      },
      aggregation,
    };
  }

  if (activeTab === YardOperationConsoleTabs.SelfService) {
    return {
      search: {
        ...rest,
        query: {
          bool: {
            filter: searchBodyFilter,
            must: compact([
              {
                term: { isSelfService: true },
              },
              ...(must || []),
            ]),
            must_not: compact([
              {
                term: {
                  'type.keyword': OrderType.NonService,
                },
              },
              {
                terms: {
                  'status.keyword': orderStatuses.slice(),
                },
              },
              ...(mustNot || []),
            ]),
          },
        },
      },
      aggregation,
    };
  }

  return {
    aggregation,
    search: {
      ...rest,
      query: {
        bool: {
          should: [
            {
              bool: {
                must,
                filter: compact([
                  {
                    range: {
                      arrivedAt: {
                        gte: startOfDay,
                      },
                    },
                  },
                  ...(searchBodyFilter || []),
                ]),
                must_not: compact([
                  {
                    bool: {
                      must: [
                        {
                          term: {
                            isSelfService: true,
                          },
                        },
                      ],
                      must_not: [
                        {
                          terms: {
                            'status.keyword': orderStatuses.slice(),
                          },
                        },
                      ],
                    },
                  },
                  ...(mustNot || []),
                ]),
              },
            },
            {
              bool: {
                must,
                filter: compact([
                  {
                    range: {
                      departureAt: {
                        gte: startOfDay,
                      },
                    },
                  },
                  ...(searchBodyFilter || []),
                ]),
                must_not: compact([
                  {
                    bool: {
                      must: [
                        {
                          term: {
                            isSelfService: true,
                          },
                        },
                      ],
                      must_not: [
                        {
                          terms: {
                            'status.keyword': orderStatuses.slice(),
                          },
                        },
                      ],
                    },
                  },
                  ...(mustNot || []),
                ]),
              },
            },
          ],
        },
      },
    },
  };
};

export const getOrdersSort: GetSortFuncFilterType = (field, order) => {
  switch (field) {
    case 'WONumber':
    case 'PONumber':
    case 'type':
    case 'material.description':
    case 'customer.businessName':
    case 'customerTruck.truckNumber':
    case 'customerTruck.type':
    case 'status':
      return {
        [`${field}.keyword`]: order,
      };
    default:
      return { [field]: order };
  }
};
