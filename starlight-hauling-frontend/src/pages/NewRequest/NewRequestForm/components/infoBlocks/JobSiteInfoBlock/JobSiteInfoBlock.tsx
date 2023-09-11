import React from 'react';
import { observer } from 'mobx-react-lite';

import { LocationIcon, ToolsIcon } from '@root/assets';
import { useStores } from '@root/hooks';

import InfoBlock from '../InfoBlock';
import { IInfoSemiBlockItem } from '../types';

const JobSiteInfoBlock: React.FC<IInfoSemiBlockItem> = ({
  readOnly = false,
  onClear,
  onConfigure,
}) => {
  const { jobSiteStore } = useStores();
  const selectedJobSite = jobSiteStore.selectedEntity;
  const address = jobSiteStore.getById(selectedJobSite?.id)?.address;

  return (
    <InfoBlock
      firstBlock={{
        heading: 'Job Site',
        headingId: selectedJobSite?.id,
        title: address?.addressLine1,
        lines: [`${address?.city ?? ''}, ${address?.state ?? ''} ${address?.zip ?? ''}`],
      }}
      thirdBlock={
        readOnly
          ? undefined
          : {
              text: 'Select another job site',
              icon: LocationIcon,
              onClick: onClear,
              semi: onConfigure && {
                text: 'Job Site Configuration',
                icon: ToolsIcon,
                onClick: onConfigure,
              },
            }
      }
    />
  );
};

export default observer(JobSiteInfoBlock);
