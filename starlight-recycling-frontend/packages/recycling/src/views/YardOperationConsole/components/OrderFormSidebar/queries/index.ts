import { gql } from '@apollo/client';

gql`
  query getCustomerTruck($id: Int!) {
    customerTruck(id: $id) {
      id
      emptyWeight
      customerId
      active
      type
      truckNumber
    }
  }
  mutation updateEquipment($data: EquipmentUpdateInput!) {
    updateEquipment(data: $data) {
      id
    }
  }
`;
