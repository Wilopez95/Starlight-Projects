import React from 'react';
import { Link } from 'react-router-dom';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Loadable } from '@root/common';
import { LinkedJobSite, LinkedProject } from '@root/components';
import linkedStyles from '@root/components/Linked/css/styles.scss';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import styles from './css/styles.scss';

const amountLinkedItems = 3;

export const LinkedItems: React.FC<{ tab: string }> = observer(({ tab }) => {
  const { customerStore, jobSiteStore, projectStore } = useStores();

  const customer = customerStore.selectedEntity;
  const { businessUnitId } = useBusinessContext();

  if (!customer) {
    return null;
  }

  if (
    (tab === 'jobSites' && jobSiteStore.loading) ||
    (tab === 'projects' && projectStore.loading)
  ) {
    return (
      <div className={styles.linkedItemsContainer}>
        {range(amountLinkedItems).map(linked => (
          <Loadable className={linkedStyles.linkedItem} height={44} key={linked} />
        ))}
      </div>
    );
  }

  if (tab === 'jobSites') {
    return (
      <div className={styles.linkedItemsContainer}>
        {jobSiteStore.values.slice(0, amountLinkedItems).map(jobSite => (
          <LinkedJobSite
            to={pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
              businessUnit: businessUnitId,
              customerId: customer.id,
              jobSiteId: jobSite.id,
              id: undefined,
            })}
            key={jobSite.id}
            entity={jobSite}
          />
        ))}
        <Link
          className={linkedStyles.linkedItem}
          to={pathToUrl(Paths.CustomerModule.JobSites, {
            businessUnit: businessUnitId,
            customerId: customer.id,
            subPath: undefined,
            jobSiteId: undefined,
          })}
        >
          See All Job Sites →
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.linkedItemsContainer}>
      {projectStore.values.slice(0, amountLinkedItems).map(project => (
        <LinkedProject
          to={pathToUrl(Paths.CustomerModule.JobSites, {
            businessUnit: businessUnitId,
            customerId: customer.id,
            subPath: undefined,
            jobSiteId: undefined,
          })}
          key={project.id}
          entity={project}
        />
      ))}
      <Link
        className={linkedStyles.linkedItem}
        to={pathToUrl(Paths.CustomerModule.JobSites, {
          businessUnit: businessUnitId,
          customerId: customer.id,
          subPath: undefined,
          jobSiteId: undefined,
        })}
      >
        See All Projects →
      </Link>
    </div>
  );
});
