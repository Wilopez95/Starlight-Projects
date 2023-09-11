import React, { useEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { LinkedJobSite } from '@root/components';
import { useStores } from '@root/hooks';

import { ILinkedJobSites } from './types';

const requestLimit = 6;

const LinkedJobSites: React.FC<ILinkedJobSites> = ({ customerId, onJobSiteSelect }) => {
  const { jobSiteStore } = useStores();

  useEffect(() => {
    jobSiteStore.cleanup();

    if (customerId) {
      jobSiteStore.requestByCustomer({
        customerId,
        limit: requestLimit,
        mostRecent: true,
        activeOnly: true,
      });
    }
  }, [customerId, jobSiteStore]);

  return (
    <>
      <Layouts.Padding bottom="3">
        <Typography
          variant="bodySmall"
          color="secondary"
          shade="light"
          textTransform="uppercase"
          fontWeight="medium"
        >
          {jobSiteStore.values.length} Linked Job Sites
        </Typography>
      </Layouts.Padding>
      <Layouts.Scroll maxHeight={250}>
        <Layouts.Flex $wrap>
          {jobSiteStore.values.map(jobSite => (
            <Layouts.Box key={jobSite.id} width="50%">
              <LinkedJobSite entity={jobSite} onClick={onJobSiteSelect} />
            </Layouts.Box>
          ))}
        </Layouts.Flex>
      </Layouts.Scroll>
    </>
  );
};

export default observer(LinkedJobSites);
