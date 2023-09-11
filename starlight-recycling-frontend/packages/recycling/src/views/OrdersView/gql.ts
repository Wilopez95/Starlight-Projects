import { gql } from '@apollo/client/core';

gql`
  query getOrdersIndexed($search: SearchBodyInput!) {
    ordersIndexed(search: $search) {
      data {
        id
        status
        createdAt
        WONumber
        type
        weightIn
        weightOut
        materialsDistribution {
          uuid
          material {
            description
          }
          value
        }
        customer {
          id
          businessName
        }
        material {
          id
          description
          units
        }
        highlight
        netWeight
        graded
        jobSiteId
        customerJobSiteId
        project {
          id
          description
        }
        materialId
      }
      total
    }
  }
`;

export const GET_ORDERS_INDEXED = gql`
  query GetOrdersIndexedWithStatusAggregation(
    $pagination: PaginationInput!
    $sort: [SortInput!]!
    $filter: OrdersIndexedFilter
    $aggregationFilter: OrdersIndexedFilter
  ) {
    ordersGrid(pagination: $pagination, sort: $sort, filter: $filter) {
      data {
        id
        status
        createdAt
        WONumber
        type
        weightIn
        weightOut
        grandTotal
        haulingOrderId
        customer {
          id
          businessName
        }
        material {
          id
          description
          units
        }
        highlight
        netWeight
        graded
        paymentMethod
      }
      total
    }
    indexedOrdersGroupByStatusTotal(filter: $aggregationFilter) {
      all
      IN_YARD
      ON_THE_WAY
      LOAD
      PAYMENT
      WEIGHT_OUT
      COMPLETED
      APPROVED
      FINALIZED
      INVOICED
    }
  }
`;

gql`
  mutation approveOrders($ids: [Int!]) {
    approveOrders(ids: $ids)
  }
`;

gql`
  mutation finalizeOrders($ids: [Int!]) {
    finalizeOrders(ids: $ids)
  }
`;
