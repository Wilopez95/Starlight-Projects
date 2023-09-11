import gql from 'graphql-tag';

export const UPDATE_COMPANY_YARD_INSTRUCTIONS = gql`
  mutation setCompanyYardInstructions($yardInstructions: String!) {
    setCompanyYardInstructions(yardInstructions: $yardInstructions) {
      id
    }
  }
`;

export const GET_COMPANY_YARD_INSTRUCTIONS = gql`
  query getCompanyYardInstructions {
    company {
      yardInstructions
    }
  }
`;
