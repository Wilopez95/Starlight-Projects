import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { LinkedProject } from '@root/components';
import { useStores } from '@root/hooks';

import { ILinkedProjects } from './types';

const LinkedProjects: React.FC<ILinkedProjects> = ({ onProjectSelect }) => {
  const { projectStore } = useStores();

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
          {projectStore.values.length} Linked Projects
        </Typography>
      </Layouts.Padding>
      <Layouts.Scroll maxHeight={250}>
        <Layouts.Flex $wrap>
          {projectStore.values.map(project => (
            <Layouts.Box key={project.id} width="50%">
              <LinkedProject entity={project} onClick={onProjectSelect} />
            </Layouts.Box>
          ))}
        </Layouts.Flex>
      </Layouts.Scroll>
    </>
  );
};

export default observer(LinkedProjects);
