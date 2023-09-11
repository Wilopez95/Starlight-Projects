import { useMemo } from 'react';
import { isSameDay, isSameHour, isSameMinute } from 'date-fns';

import { IWorkOrderComment } from '@root/types';
import { isEmpty } from 'lodash';

const compareDates = (comment1: Date, comment2: Date) =>
  isSameDay(comment1, comment2) &&
  isSameHour(comment1, comment2) &&
  isSameMinute(comment1, comment2);

export const useCommentBlocks = (values: IWorkOrderComment[]) => {
  const commentBlocksItem: IWorkOrderComment[][] | null = useMemo(() => {
    if (!values.length) {
      return null;
    }

    return values.reduce<IWorkOrderComment[][]>(
      (commentBlocks: IWorkOrderComment[][], currentComment) => {
        const previousBlock: IWorkOrderComment[] = commentBlocks[commentBlocks.length - 1];

        if (!isEmpty(previousBlock)) {
          commentBlocks.push([currentComment]);
          return commentBlocks;
        }

        const currentAuthorName = currentComment.authorName;
        const previousAuthorName = previousBlock[0].authorName;
        const isSameAuthor = currentAuthorName === previousAuthorName;

        const currentCreatedAt =
          typeof currentComment.createdAt === 'string'
            ? new Date(currentComment.createdAt)
            : currentComment.createdAt;
        const previousCreatedAt =
          typeof previousBlock[0].createdAt === 'string'
            ? new Date(previousBlock[0].createdAt)
            : previousBlock[0].createdAt;
        const isSameDate = compareDates(currentCreatedAt, previousCreatedAt);

        if (isSameAuthor && isSameDate) {
          previousBlock.push(currentComment);
        } else {
          commentBlocks.push([currentComment]);
        }

        return commentBlocks;
      },
      [],
    );
  }, [values]);

  return commentBlocksItem;
};
