import gql from 'graphql-tag';

export const typeDefs = gql`
  type JobSite {
    id: Int!
    name: String
    address: Address
    location: String
    coordinates: Coordinates
  }
`;

export const resolvers = {
  JobSite: {
    id: jobSite => jobSite.originalId || jobSite.id,
    address: jobSite => {
      if (jobSite.address) {
        return jobSite.address;
      }

      return {
        addressLine1: jobSite.addressLine1,
        addressLine2: jobSite.addressLine2,
        fullAddress: jobSite.fullAddress,
        city: jobSite.city,
        state: jobSite.state,
        zip: jobSite.zip,
      };
    },
  },
};
