import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { useTimeZone, useUserContext } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IWorkOrderComment, CommentColorEnum } from '@root/types';

import { Message } from '../Message/Message';

interface IComment {
  commentBlock: IWorkOrderComment[];
}

export const Comment: React.FC<IComment> = ({ commentBlock }) => {
  const { currentUser } = useUserContext();
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();
  const { authorName, authorRole, createdAt } = commentBlock[0];
  const isCurrentUserComment = authorName === currentUser?.name;
  const backgroundColor = isCurrentUserComment
    ? CommentColorEnum.grey200
    : CommentColorEnum.grey300;

  return (
    <Layouts.Box width="100%">
      <Layouts.Margin top="2">
        <Layouts.Flex direction="column">
          <Layouts.Flex justifyContent={isCurrentUserComment ? 'flex-end' : 'flex-start'}>
            <Typography variant="bodyMedium" color="default" shade="dark">
              {authorName}
            </Typography>
            <Layouts.Margin as="span" left="0.5" right="0.5">
              <Typography variant="bodyMedium" shade="desaturated">
                •
              </Typography>
            </Layouts.Margin>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {authorRole}
            </Typography>
          </Layouts.Flex>
          <Typography
            variant="bodySmall"
            shade="desaturated"
            color="secondary"
            textAlign={isCurrentUserComment ? 'right' : 'left'}
          >
            {
              formatDateTime(typeof createdAt === 'string' ? new Date(createdAt) : createdAt, {
                timeZone,
              }).dateTime
            }
          </Typography>
          {commentBlock.map(({ comment }, index) => (
            <Layouts.Margin key={index} top="1">
              <Message key={index} message={comment} backgroundColor={backgroundColor} />
            </Layouts.Margin>
          ))}
        </Layouts.Flex>
      </Layouts.Margin>
    </Layouts.Box>
  );
};
