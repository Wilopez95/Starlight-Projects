import { gql } from '@apollo/client';

export const GET_SERVICE_DAYS_AND_HOURS = gql`
  query getServiceDays {
    serviceDaysAndHours {
      data {
        id
        dayOfWeek
        startTime
        endTime
        businessUnitId
      }
    }
  }
`;
