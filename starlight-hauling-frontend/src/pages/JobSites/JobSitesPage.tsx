import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Layouts, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { Typography } from '@root/common';
import {
  Table,
  TableInfiniteScroll,
  TablePageContainer,
  TableTools,
} from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { JobSiteModal } from '@root/components/modals';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  useCrudPermissions,
  useStores,
} from '@root/hooks';
import { JobSiteQuickView } from '@root/quickViews';
import { JobSite } from '@root/stores/entities';

import { JobSitesTableHeader } from './JobSitesTable/Header';
import JobSitesTable from './JobSitesTable/JobSitesTable';
import { JobSitesFilters } from './JobSitesFilters';
import { IJobSitesPageParams } from './types';

import styles from './css/styles.scss';

const tabs: NavigationConfigItem[] = [
  {
    index: 0,
    label: 'Active Job Sites',
    key: 'active',
  },
];

const I18N_PATH = 'pages.JobSites.Text.';

const JobSitesPage: React.FC = () => {
  const { jobSiteStore, serviceAreaStore } = useStores();
  const [isJobSiteModalOpen, openJobSiteModal, closeJobSiteModal] = useBoolean();
  const { businessUnitId } = useBusinessContext();

  const { id: jobSiteId } = useParams<IJobSitesPageParams>();

  const [selectedTab, setSelectedTab] = useState<NavigationConfigItem>(tabs[0]);
  const [filterState, setFilterState] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();

  const [canViewServiceAreas] = useCrudPermissions('configuration', 'service-areas');

  const { t } = useTranslation();
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useCleanup(jobSiteStore, 'city', 'asc');

  const selectedJobsite = jobSiteStore.selectedEntity;

  const handleJobSiteFormSubmit = useCallback(
    async (jobSite: IJobSiteData) => {
      await jobSiteStore.create({ data: jobSite, filterData: filterState, query: search }, false);

      closeJobSiteModal();
    },
    [closeJobSiteModal, filterState, jobSiteStore, search],
  );

  const handleJobSitesRequest = useCallback(() => {
    jobSiteStore.request({ filterData: filterState, query: search });
  }, [filterState, jobSiteStore, search]);

  const handleChangeSort = useCallback(() => {
    jobSiteStore.cleanup();
    handleJobSitesRequest();
  }, [handleJobSitesRequest, jobSiteStore]);

  useEffect(() => {
    jobSiteStore.cleanup();
    handleJobSitesRequest();
    jobSiteStore.requestCount({ filterData: filterState, query: search });
  }, [jobSiteStore, filterState, search, handleJobSitesRequest]);

  useEffect(() => {
    if (canViewServiceAreas) {
      serviceAreaStore.request({ businessUnitId });
    }
  }, [canViewServiceAreas, serviceAreaStore, businessUnitId]);

  useEffect(() => {
    if (jobSiteId && !selectedJobsite) {
      jobSiteStore.requestById(+jobSiteId, { shouldOpenQuickView: true });
    }
  }, [jobSiteId, jobSiteStore, selectedJobsite]);

  const handleSelectJobSite = useCallback(
    (jobSite: JobSite) => {
      jobSiteStore.selectEntity(jobSite);
    },
    [jobSiteStore],
  );

  return (
    <>
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onFormSubmit={handleJobSiteFormSubmit}
        onClose={closeJobSiteModal}
        overlayClassName={styles.jobSiteModalOverlay}
        withMap
      />
      <JobSiteQuickView
        closeUrl={pathToUrl(Paths.JobSitesModule.JobSites, {
          businessUnit: businessUnitId,
        })}
        openUrl={pathToUrl(Paths.JobSitesModule.JobSites, {
          businessUnit: businessUnitId,
          id: selectedJobsite?.id,
        })}
        clickOutContainers={tableBodyRef}
        isOpen={jobSiteStore.isOpenQuickView}
      />
      <TablePageContainer>
        <Layouts.Margin bottom="2">
          <Layouts.Flex
            as={Layouts.Box}
            alignItems="center"
            justifyContent="space-between"
            minHeight="50px"
          >
            <Layouts.Flex alignItems="center">
              <Typography as="h1" variant="headerTwo">
                All Job Sites
              </Typography>
              <Layouts.Margin left="2">
                <Typography variant="bodyMedium">
                  {jobSiteStore.values.length} of {jobSiteStore?.counts?.filteredTotal ?? 0}
                </Typography>
              </Layouts.Margin>
            </Layouts.Flex>
            <Button variant="primary" iconLeft={PlusIcon} onClick={openJobSiteModal}>
              New Job Site
            </Button>
          </Layouts.Flex>
        </Layouts.Margin>

        <TableTools.ScrollContainer>
          <TableTools.HeaderNavigation
            selectedTab={selectedTab}
            tabs={tabs}
            onSearch={setSearch}
            onChangeTab={setSelectedTab}
            placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
            filterable
          >
            <JobSitesFilters onApply={setFilterState} />
          </TableTools.HeaderNavigation>
          <Table>
            <Helmet title={t('Titles.AllJobSites')} />
            <JobSitesTableHeader onSort={handleChangeSort} />
            <JobSitesTable onSelect={handleSelectJobSite} ref={tableBodyRef} />
          </Table>

          <TableInfiniteScroll
            onLoaderReached={handleJobSitesRequest}
            loaded={jobSiteStore.loaded}
            loading={jobSiteStore.loading}
            initialRequest={false}
          >
            Loading Job Sites
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </TablePageContainer>
    </>
  );
};

export default observer(JobSitesPage);
