import React from 'react';

import { TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import { IJobSitesHeader } from './types';

export const JobSitesTableHeader: React.FC<IJobSitesHeader> = ({ onSort }) => {
  const { jobSiteStore } = useStores();

  return (
    <TableTools.Header>
      <TableTools.SortableHeaderCell store={jobSiteStore} sortKey="name" onSort={onSort}>
        Name
      </TableTools.SortableHeaderCell>
      <TableTools.HeaderCell>Address</TableTools.HeaderCell>
      <TableTools.SortableHeaderCell store={jobSiteStore} sortKey="city" onSort={onSort}>
        City
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={jobSiteStore} sortKey="state" onSort={onSort}>
        State
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={jobSiteStore} sortKey="zip" onSort={onSort}>
        Zip
      </TableTools.SortableHeaderCell>
      <TableTools.HeaderCell right>Tax Districts</TableTools.HeaderCell>
    </TableTools.Header>
  );
};
