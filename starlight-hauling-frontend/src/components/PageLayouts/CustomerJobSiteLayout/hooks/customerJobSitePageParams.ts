import { useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';

import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';

export const useCustomerJobSitePageParams = (): UseCustomerJobSitePageParamsResponse => {
  const { jobSiteStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { customerId, jobSiteId, subPath: prevSubPath } = useParams<ICustomerJobSitePageParams>();
  const history = useHistory();

  const jobSites = jobSiteStore.filteredValues;
  const subPath = jobSiteId ? prevSubPath : Routes.OpenOrders;

  useCleanup(jobSiteStore);

  const handleBuildUrl = useCallback(
    (value?: string | number) => {
      return pathToUrl(Paths.CustomerModule.JobSites, {
        businessUnit: businessUnitId,
        customerId,
        jobSiteId: value,
        subPath,
      });
    },
    [businessUnitId, customerId, subPath],
  );

  useEffect(() => {
    if (!jobSiteId || jobSiteStore.getById(jobSiteId)) {
      return;
    }

    jobSiteStore.requestByCustomerById({ customerId: +customerId, jobSiteId: +jobSiteId });
  }, [customerId, jobSiteId, jobSiteStore]);

  useEffect(() => {
    const maybeFallbackJobSite = jobSites[0];
    const maybeFallbackUrl = maybeFallbackJobSite ? handleBuildUrl(maybeFallbackJobSite.id) : null;

    if (!jobSiteId) {
      if (maybeFallbackUrl) {
        jobSiteStore.selectEntity(maybeFallbackJobSite, false);
        history.push(maybeFallbackUrl);
      } else {
        jobSiteStore.unSelectEntity();
      }

      return;
    }

    const currentJobsite = jobSiteStore.getById(jobSiteId);

    if (currentJobsite) {
      jobSiteStore.selectEntity(currentJobsite, false);

      return;
    }

    if (maybeFallbackUrl) {
      jobSiteStore.selectEntity(maybeFallbackJobSite, false);
      history.push(maybeFallbackUrl);
    } else {
      jobSiteStore.unSelectEntity();
    }
  }, [jobSiteStore, jobSiteId, handleBuildUrl, history, jobSites]);

  return {
    buildJobSiteUrl: handleBuildUrl,
    jobSiteId,
  };
};

interface ICustomerJobSitePageParams {
  customerId: string;
  jobSiteId?: string;
  subPath?: string;
}

export type UseCustomerJobSitePageParamsResponse = {
  jobSiteId?: string;
  buildJobSiteUrl(jobSiteId: string | number): string;
};
