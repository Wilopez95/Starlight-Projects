import { useMemo } from 'react';
import {
  GetHaulingCustomerJobSitesQuery,
  useGetHaulingCustomerJobSitesQuery,
} from '../../../graphql/api';
import debounce from 'lodash/debounce';
import { SelectOptionType } from '../../../components/FinalForm/SearchField';
import { CustomerJobSiteOption } from '../Inputs/JobSiteInput';

const MIN_SEARCH_LENGTH = 3;

interface IProps {
  customerId: number;
  debounceTimeout?: number;
}

export const useDebouncedHaulingCustomerJobSitesRequest = ({
  customerId,
  debounceTimeout = 300,
}: IProps) => {
  const { data, refetch, loading } = useGetHaulingCustomerJobSitesQuery({
    variables: {
      filter: {
        customerId,
      },
    },
    skip: !customerId,
    fetchPolicy: 'no-cache',
  });

  const setInputDebounced = useMemo(() => {
    return debounce((value: string | SelectOptionType) => {
      let searchTerm: string = value as string;

      if (typeof value !== 'string') {
        searchTerm = value.label;
      }

      if ((!!searchTerm && searchTerm.length >= MIN_SEARCH_LENGTH) || !searchTerm) {
        refetch({
          filter: {
            query: searchTerm,
            customerId,
          },
        });
      }
    }, debounceTimeout);
  }, [customerId, refetch, debounceTimeout]);

  const jobSiteOptions = useMemo(() => {
    if (!data || !data.haulingCustomerJobSites || !customerId) {
      return [];
    }

    const { haulingCustomerJobSites } = data as GetHaulingCustomerJobSitesQuery;

    return haulingCustomerJobSites
      .filter(({ active }) => active)
      .map((jobSite) => ({
        label: jobSite.fullAddress,
        value: jobSite.id,
        popupNote: jobSite.popupNote,
        jobSite: jobSite,
      })) as CustomerJobSiteOption[];
  }, [data, customerId]);

  return {
    data,
    jobSiteOptions,
    setInputDebounced,
    loading,
  };
};
