import React, { useEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { Comment } from '../Comment/Comment';

import { useCommentBlocks } from './hooks/useCommentBlocks';
import { IComments } from './types';

// 16 = 2rem;
const BOTTOM_PADDING = 16;

export const Comments: React.FC<IComments> = observer(({ height, workOrderId }) => {
  const { workOrderCommentsStore } = useStores();

  useEffect(() => {
    workOrderCommentsStore.getComments(workOrderId);
  }, [workOrderCommentsStore, workOrderId]);

  const commentBlocks = useCommentBlocks(workOrderCommentsStore.values);

  return (
    <Layouts.Scroll height={height - BOTTOM_PADDING}>
      <Layouts.Box position="relative" width="100%" backgroundColor="white" height="100%">
        <Layouts.Padding padding="1">
          <Layouts.Flex justifyContent="center" alignItems="center" direction="column">
            <Layouts.Box width="100%">
              {commentBlocks?.map((commentBlock, index) => (
                <Layouts.Margin key={index} top="1" bottom="1">
                  <Comment commentBlock={commentBlock} />
                </Layouts.Margin>
              ))}
            </Layouts.Box>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </Layouts.Scroll>
  );
});
