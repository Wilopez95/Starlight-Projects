import { makeRecyclingRequest } from '../utils/makeRequest.js';

import { AMQP_QUEUE_WORK_ORDERS_TO_RECYCLING } from '../config.js';
import MqSender from './amqp/sender.js';

const GET_MATERIAL_CODES = `
    query getMaterials($filter: MaterialFilter!, $pagination: PaginationInput!) {
        materials(filter: $filter, pagination: $pagination) {
            data {
                id
                description
                active
                code
            }
            total
        }
}
`;

const GET_RECYCLING_ORDER = `
    query getRecyclingOrder($id: Int!) {
        order(id: $id) {
            id
            status
            customerTruck {
                id
                truckNumber
                type
                emptyWeight
            }
            material {
                id
            }
            container {
                id
            }
            departureAt
            arrivedAt
            weightTicketAttachedAt
            weightTicketCreator {
              id
              name
              email
            }
            weightTicketCreatorId
            weightTicketUrl
            weightTicketPrivateUrl
            weightInUnit
            WONumber
            PONumber
            weightIn
            weightOut
            images {
                url
                filename
            }
            originDistrict {
              id
            }
            materialsDistribution {
                uuid
                materialId
                material {
                    id
                    description
                    code
                }
                value
            }
            miscellaneousMaterialsDistribution {
                uuid
                materialId
                material {
                    id
                    description
                    code
                }
                quantity
            }
            beforeTaxesTotal
            grandTotal
        }
    }
`;
const GET_RECYCLING_ORDERS = `
    query ordersByHaulingIds($ids: [Int!]!) {
      ordersByHaulingId(ids: $ids) {
        id
        WONumber
        weightTicketPrivateUrl
        haulingOrderId
        images {
          filename
          url
        }
      }
    }`;
export const getRecyclingMaterialCodes = ctx =>
  makeRecyclingRequest(ctx, {
    method: 'post',
    url: '/graphql',
    data: {
      query: GET_MATERIAL_CODES,
      variables: {
        filter: {
          active: null,
          withCodeOnly: true,
        },
        pagination: {
          page: 1,
          perPage: 100,
        },
      },
    },
  });

export const getRecyclingOrderById = (ctx, id) =>
  makeRecyclingRequest(ctx, {
    method: 'post',
    url: '/graphql',
    data: {
      query: GET_RECYCLING_ORDER,
      variables: {
        id,
      },
    },
  });

export const getRecyclingOrderByIds = (ctx, ids) =>
  makeRecyclingRequest(ctx, {
    method: 'post',
    url: '/graphql',
    data: {
      query: GET_RECYCLING_ORDERS,
      variables: {
        ids,
      },
    },
  });

const mqSender = MqSender.getInstance();

export const syncWorkOrderToRecycling = (ctx, data) =>
  mqSender.sendTo(ctx, AMQP_QUEUE_WORK_ORDERS_TO_RECYCLING, data);
