import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Switch, Typography } from '@root/common';
import { RoutingNavigation, RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { TableInfiniteScroll } from '@root/common/TableTools';
import { FormikLinkJobSite } from '@root/components/forms/LinkJobSite/types';
import { LinkJobSiteModal } from '@root/components/modals';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores, useToggle } from '@root/hooks';
import { JobSite } from '@root/stores/entities';

import JobSiteNavigationItem from '../JobSiteNavigationItem/JobSiteNavigationItem';

import { IJobSiteSideBar } from './types';

import styles from './css/styles.scss';

const loadingConfig: RoutingNavigationItem[] = range(8).map(item => ({
  loading: true,
  content: item,
  width: '90%',
}));

const SideBar: React.ForwardRefRenderFunction<HTMLDivElement, IJobSiteSideBar> = (
  { onClick, buildJobSiteUrl, search },
  ref,
) => {
  const I18N_PATH = 'components.PageLayouts.CustomerJobSiteLayout.components.SideBar.Text.';
  const { customerStore, jobSiteStore } = useStores();
  const [isLinkModalOpen, toggleLinkModalOpen] = useToggle();
  const history = useHistory();
  const { t } = useTranslation();

  const selectedCustomer = customerStore.selectedEntity;
  const { loaded } = jobSiteStore;
  const { loading } = jobSiteStore;
  const jobSites = jobSiteStore.filteredValues;

  const handleLoadMore = useCallback(() => {
    if (!selectedCustomer || search) {
      return;
    }
    jobSiteStore.requestByCustomer({
      customerId: selectedCustomer.id,
    });
  }, [jobSiteStore, search, selectedCustomer]);

  useEffect(handleLoadMore, [handleLoadMore]);

  const handleCreateJobSite = useCallback(
    (jobSite: JobSite) => {
      const url = buildJobSiteUrl(jobSite.id);

      history.push(url);
    },
    [buildJobSiteUrl, history],
  );

  const handleLinkJobSiteSubmit = useCallback(
    async ({ jobSiteId }: FormikLinkJobSite) => {
      if (!selectedCustomer || !jobSiteId) {
        return;
      }

      const { id, poRequired, signatureRequired, invoiceEmails } = selectedCustomer;
      const jobSite = await jobSiteStore.requestById(jobSiteId);

      toggleLinkModalOpen();
      const newJobSite = await jobSiteStore.linkToCustomer({
        active: true,
        permitRequired: false,
        alleyPlacement: jobSite?.alleyPlacement ?? false,
        cabOver: jobSite?.cabOver ?? false,
        customerId: id,
        jobSiteId,
        popupNote: null,
        poRequired,
        signatureRequired,
        invoiceEmails,
        sendInvoicesToJobSite: false,
        taxDistricts: undefined,
        workOrderNotes: null,
      });

      if (newJobSite) {
        const url = buildJobSiteUrl(newJobSite.id);

        history.push(url);
      }
    },
    [buildJobSiteUrl, history, jobSiteStore, selectedCustomer, toggleLinkModalOpen],
  );

  const handleChangeShowInactive = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      jobSiteStore.changeShowInactive(e.target.checked);
    },
    [jobSiteStore],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        toggleLinkModalOpen();
      }
    },
    [toggleLinkModalOpen],
  );

  // eslint-disable-next-line no-nested-ternary
  const jobSitesNavigation: RoutingNavigationItem[] = jobSites.length
    ? jobSites.map(jobSite => ({
        content: <JobSiteNavigationItem jobSite={jobSite} onClick={onClick} />,
        to: buildJobSiteUrl(jobSite.id),
      }))
    : jobSiteStore.loaded
    ? []
    : loadingConfig;

  return (
    <div className={styles.sidebar}>
      <Layouts.Scroll>
        <LinkJobSiteModal
          isOpen={isLinkModalOpen}
          onFormSubmit={handleLinkJobSiteSubmit}
          onClose={toggleLinkModalOpen}
          onJobSiteCreate={handleCreateJobSite}
        />
        <div className={styles.linkJobSite}>
          <Typography
            color="information"
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={toggleLinkModalOpen}
          >
            <span className={styles.plus}>+</span>
            {t(`${I18N_PATH}LinkJobSite`)}
          </Typography>
        </div>
        <div className={styles.linkedSettings}>
          <Switch
            name="showInactiveJobSites"
            value={jobSiteStore.shouldShowInactive}
            onChange={handleChangeShowInactive}
            labelClass={styles.switch}
          >
            {t(`${I18N_PATH}ShowInactive`)}
          </Switch>
        </div>
        <RoutingNavigation
          ref={ref}
          routes={jobSitesNavigation}
          className={styles.jobSitesNavigation}
          direction="column"
        />
        {!search ? (
          <TableInfiniteScroll onLoaderReached={handleLoadMore} loading={loading} loaded={loaded}>
            Loading JobSites
          </TableInfiniteScroll>
        ) : null}
      </Layouts.Scroll>
    </div>
  );
};

export default observer(SideBar, {
  forwardRef: true,
});
