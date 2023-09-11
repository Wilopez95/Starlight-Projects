import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { IMapMergeData } from '@root/types';

import { Header } from './Header';
import { Item } from './Item';
import { Box } from './styles';
import { Tabs } from './Tabs';

interface IWorkOrderDetails {
  data: IMapMergeData;
  onClosePopup: () => void;
}

export const WorkOrderDetailsModal: React.FC<IWorkOrderDetails> = ({
  data: { pinItemId, jobSiteGroupedItems },
  onClosePopup,
}) => (
  <Box position="relative" backgroundColor="white">
    <Header id={pinItemId} onClosePopup={onClosePopup} jobSiteGroupedItems={jobSiteGroupedItems} />
    <Layouts.Margin top="1" />
    {jobSiteGroupedItems?.length ? (
      <Tabs jobSiteGroupedItems={jobSiteGroupedItems} />
    ) : (
      <Item pinItemId={pinItemId} single />
    )}
  </Box>
);
