import { gql } from '@apollo/client';
import { GetCompanyGeneralSettingsQuery, useGetCompanyGeneralSettingsQuery } from '../graphql/api';

gql`
  query getCompanyGeneralSettings {
    company {
      businessUnitId
      businessLineId
      jobSiteId
      timezone
      businessTimeSundayStart
      businessTimeSundayEnd
      businessTimeMondayStart
      businessTimeMondayEnd
      businessTimeTuesdayStart
      businessTimeTuesdayEnd
      businessTimeWednesdayStart
      businessTimeWednesdayEnd
      businessTimeThursdayStart
      businessTimeThursdayEnd
      businessTimeFridayStart
      businessTimeFridayEnd
      businessTimeSaturdayStart
      businessTimeSaturdayEnd
      printNodeApiKey
      region
    }
  }
`;

export const useCompanySettings = () => {
  const { data } = useGetCompanyGeneralSettingsQuery({
    fetchPolicy: 'cache-first',
  });

  return data?.company || ({} as Partial<GetCompanyGeneralSettingsQuery['company']>);
};
