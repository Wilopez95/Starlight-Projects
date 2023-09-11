import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { DeleteIcon, EditIcon } from '@root/assets';
import { Typography } from '@root/common';
import { MULTIPLE_SPACES } from '@root/consts';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerComment } from '@root/stores/customerComment/CustomerComment';

import styles from '../../css/styles.scss';

interface IComment {
  comment: CustomerComment;
  onEdit(comment: CustomerComment): void;
  onDelete(id: number): void;
}

const MAX_CONTENT_LENGTH = 256;

const Comment: React.FC<IComment> = ({ comment, onEdit, onDelete }) => {
  const { userStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onEdit(comment);
      }
    },
    [comment, onEdit],
  );

  const handleDeleteKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onDelete(comment.id);
      }
    },
    [comment, onDelete],
  );

  if (userStore.loading) {
    return null;
  }

  const trimComment = comment.content.replace(MULTIPLE_SPACES, ' ');
  const formattedCommentContent =
    trimComment.length > MAX_CONTENT_LENGTH
      ? trimComment.slice(0, MAX_CONTENT_LENGTH)
      : comment.content;

  return (
    <div className={styles.comment}>
      <div className={styles.header}>
        {userStore.getById(comment.authorId)?.fullName ?? t('Text.Unknown')}
        <div>
          <EditIcon
            role="button"
            aria-label={t('Text.Edit')}
            tabIndex={0}
            onClick={() => onEdit(comment)}
            onKeyDown={handleEditKeyDown}
          />
          <DeleteIcon
            role="button"
            aria-label={t('Text.Delete')}
            tabIndex={0}
            className={styles.deleteIcon}
            onClick={() => onDelete(comment.id)}
            onKeyDown={handleDeleteKeyDown}
          />
        </div>
      </div>
      <Typography className={styles.subHeader} fontWeight="medium">
        {formatDateTime(comment.createdAt as Date).date},{' '}
        {formatDateTime(comment.createdAt as Date, { timeZone: localTimeZone }).time}
      </Typography>
      <div className={styles.content}>
        {formattedCommentContent}
        {comment.content.length > MAX_CONTENT_LENGTH ? (
          <Typography
            as="span"
            className={styles.showMoreLink}
            color="information"
            onClick={() => onEdit(comment)}
            onKeyDown={handleEditKeyDown}
            tabIndex={0}
          >
            ...{t('Text.ShowMore')}
          </Typography>
        ) : null}
      </div>
    </div>
  );
};

export default observer(Comment);
