import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api/global/global';
import { NoJobSitesIcon, ToolsIcon } from '@root/assets';
import { Protected, Typography } from '@root/common';
import { convertDates, handleEnterOrSpaceKeyDown, pathToUrl } from '@root/helpers';
import { useBoolean, useCleanup, useStores } from '@root/hooks';
import { CustomerJobSiteQuickView, ProjectQuickView } from '@root/quickViews';

import { Paths } from '@root/consts';
import { useCustomerJobSitePageParams } from './hooks/customerJobSitePageParams';
import { JobSiteSideBar, ProjectFilter } from './components';
import { ICustomerJobSiteLayout } from './types';

import styles from './css/styles.scss';

const CustomerJobSiteLayout: React.FC<ICustomerJobSiteLayout> = ({
  children,
  projectId,
  search,
  onProjectSelect,
}) => {
  const I18N_PATH = 'components.PageLayouts.CustomerJobSiteLayout.Text.';
  const { customerStore, jobSiteStore, projectStore } = useStores();

  const sideBarRef = useRef<HTMLDivElement>(null);

  const { jobSiteId, buildJobSiteUrl } = useCustomerJobSitePageParams();

  const [isProjectQuickViewOpen, openProjectQuickView, closeProjectQuickView] = useBoolean();
  const [
    isCustomerJobSiteDetailsOpen,
    setCustomerJobSiteDetailsOpen,
    setCustomerJobSiteDetailsClose,
  ] = useBoolean();
  const { t } = useTranslation();

  const selectedCustomer = customerStore.selectedEntity;
  const currentJobSite = jobSiteStore.selectedEntity;
  const jobSites = jobSiteStore.values;
  const isLoaded = jobSiteStore.loaded;

  const handleCleanProjectFilter = useCallback(() => {
    onProjectSelect(undefined);
  }, [onProjectSelect]);

  useEffect(() => {
    if (!selectedCustomer || !jobSiteId) {
      return;
    }

    const query = async () => {
      projectStore.cleanup();
      const cjsPairResponse = await GlobalService.getJobSiteCustomerPair(
        +jobSiteId,
        selectedCustomer.id,
      );
      const cjsPair = convertDates(cjsPairResponse);
      const customerJobSiteId = cjsPair?.id;

      if (customerJobSiteId) {
        projectStore.requestAll({ customerJobSiteId });
      }
    };

    query();
  }, [selectedCustomer, jobSiteId, projectStore]);

  useCleanup(projectStore);

  const handleProjectQuickViewClose = useCallback(() => {
    projectStore.unSelectEntity();

    closeProjectQuickView();
  }, [closeProjectQuickView, projectStore]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        callback();
      }
    },
    [],
  );

  return (
    <>
      <CustomerJobSiteQuickView
        clickOutContainers={sideBarRef}
        isOpen={isCustomerJobSiteDetailsOpen}
        onClose={setCustomerJobSiteDetailsClose}
        shouldDeselect={false}
      />
      <ProjectQuickView
        isOpen={isProjectQuickViewOpen || !!projectStore.selectedEntity}
        onClose={handleProjectQuickViewClose}
      />

      <div className={styles.page}>
        <JobSiteSideBar
          ref={sideBarRef}
          buildJobSiteUrl={buildJobSiteUrl}
          onClick={handleCleanProjectFilter}
          search={search}
        />
        {currentJobSite ? (
          <Layouts.Scroll overflowY="hidden" overflowX="auto" className={styles.contentWrapper}>
            <div className={styles.headingWrapper}>
              <div className={styles.heading}>
                <h2>{currentJobSite.displayName}</h2>
                {currentJobSite.name ? (
                  <div className={styles.fullAddress}>{currentJobSite.fullAddress}</div>
                ) : null}
                <ProjectFilter selectedProjectId={projectId} setProject={onProjectSelect} />
              </div>

              <div className={styles.configLabels}>
                <Typography
                  color="information"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => handleKeyDown(e, setCustomerJobSiteDetailsOpen)}
                  onClick={setCustomerJobSiteDetailsOpen}
                  className={styles.configLabel}
                >
                  <ToolsIcon /> {t(`${I18N_PATH}CustomerJobSiteDetails`)}
                </Typography>
                <Typography
                  color="information"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => handleKeyDown(e, openProjectQuickView)}
                  onClick={openProjectQuickView}
                  className={styles.configLabel}
                >
                  <span className={styles.plus}>+</span>
                  {t(`${I18N_PATH}CreateProject`)}
                </Typography>
                <div className={styles.buttonSpace}>
                  <Protected permissions="orders:new-order:perform">
                    <Button
                      variant="primary"
                      to={pathToUrl(
                        `${Paths.RequestModule.Request}?customerId=${
                          selectedCustomer?.id ?? ''
                        }&jobSiteId=${jobSiteId ?? ''}`,
                        {
                          businessUnit: selectedCustomer?.businessUnitId,
                        },
                      )}
                    >
                      {t(`${I18N_PATH}CreateNewOrder`)}
                    </Button>
                  </Protected>
                </div>
              </div>
            </div>
            {children}
          </Layouts.Scroll>
        ) : null}
        {!currentJobSite && isLoaded ? (
          <div className={styles.notFound}>
            {jobSites.length === 0 && search ? (
              <div>{t(`${I18N_PATH}NoSearchResults`)}</div>
            ) : (
              <>
                <NoJobSitesIcon />
                <div>{t(`components.PageLayouts.CustomerJobSiteLayout.Errors.NotFound`)}</div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default observer(CustomerJobSiteLayout);
