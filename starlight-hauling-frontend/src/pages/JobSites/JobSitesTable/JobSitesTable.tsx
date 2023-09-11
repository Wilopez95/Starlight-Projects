import React from 'react';
import { observer } from 'mobx-react-lite';

import { TableBody, TableCell, TableRow } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import { type IJobSitesTable } from './types';

const JobSitesTable: React.ForwardRefRenderFunction<HTMLTableSectionElement, IJobSitesTable> = (
  { onSelect },
  ref,
) => {
  const { jobSiteStore } = useStores();

  return (
    <TableBody loading={jobSiteStore.loading} cells={6} noResult={jobSiteStore.noResult} ref={ref}>
      {jobSiteStore.values.map(jobSite => {
        return (
          <TableRow
            key={jobSite.id}
            selected={jobSiteStore.selectedEntity?.id === jobSite.id}
            onClick={() => onSelect(jobSite)}
          >
            <TableCell>{jobSite.name ?? '-'}</TableCell>
            <TableCell>{jobSite.address.addressLine1}</TableCell>
            <TableCell>{jobSite.address.city}</TableCell>
            <TableCell>{jobSite.address.state}</TableCell>
            <TableCell>{jobSite.address.zip}</TableCell>
            <TableCell right>{jobSite.taxDistrictsCount ?? 0}</TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default observer(JobSitesTable, { forwardRef: true });
