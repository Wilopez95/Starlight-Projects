import { gql } from '@apollo/client';

gql`
  query GetGradingOrder($id: Int!) {
    order(id: $id) {
      id
      customerTruck {
        truckNumber
        type
      }
      customer {
        id
        businessName
      }
      materialsDistribution {
        uuid
        materialId
        material {
          id
          description
        }
        value
      }
      miscellaneousMaterialsDistribution {
        uuid
        materialId
        material {
          id
          description
        }
        quantity
      }
      images {
        url
        filename
      }
    }
  }
`;

gql`
  query GetGradingOrdersIndexed($search: SearchBodyInput!) {
    ordersIndexed(search: $search) {
      data {
        id
        type
        WONumber
        customerId
        graded
        customer {
          id
          businessName
        }
        customerTruck {
          truckNumber
          type
        }
      }
      total
    }
  }
`;

gql`
  mutation gradingOrder($gradingPayload: GradingPayloadInput!) {
    gradingOrder(gradingPayload: $gradingPayload)
  }
`;
