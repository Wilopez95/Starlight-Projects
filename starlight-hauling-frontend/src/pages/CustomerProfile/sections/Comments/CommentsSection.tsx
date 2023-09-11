import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { ConfirmModal, CustomerCommentModal } from '@root/components/modals';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores, useToggle } from '@root/hooks';
import { type CustomerComment } from '@root/stores/customerComment/CustomerComment';
import { type CustomerCommentRequest } from '@root/types';

import Comment from './components/Comment/Comment';

import styles from './css/styles.scss';

const commentsPerPage = 3;

const CommentsSection: React.FC = () => {
  const { customerCommentStore, customerStore } = useStores();
  const [page, setPage] = useState(1);
  const commentToDelete = useRef<number>();
  const [isDeleteModalOpen, toggleDeleteModalOpen] = useToggle();
  const [isCommentModalOpen, toggleCommentModalOpen] = useToggle();
  const { t } = useTranslation();

  const currentComment = customerCommentStore.selectedEntity;
  const currentCustomer = customerStore.selectedEntity;
  const visibleComments = customerCommentStore.sortedValues.slice(0, page * commentsPerPage);

  const handleShowMoreClick = useCallback(() => {
    setPage(page + 1);
  }, [page]);

  const handleCommentDelete = useCallback(() => {
    if (commentToDelete.current && currentCustomer) {
      customerCommentStore.delete(currentCustomer.id, commentToDelete.current);
    }
    toggleDeleteModalOpen();
  }, [currentCustomer, customerCommentStore, toggleDeleteModalOpen]);

  const handleCloseModal = useCallback(() => {
    customerCommentStore.unSelectEntity();
    toggleCommentModalOpen();
  }, [customerCommentStore, toggleCommentModalOpen]);

  const handleEditClick = (comment: CustomerComment) => {
    customerCommentStore.selectEntity(comment);
    toggleCommentModalOpen();
  };

  const handleDeleteClick = (id: number) => {
    commentToDelete.current = id;
    toggleDeleteModalOpen();
  };

  const handleCommentSubmit = useCallback(
    (values: CustomerCommentRequest) => {
      if (currentCustomer) {
        if (!currentComment) {
          customerCommentStore.create(currentCustomer.id, values);
        } else {
          customerCommentStore.update(currentCustomer.id, currentComment.id, values);
        }
      }

      handleCloseModal();
    },
    [currentComment, currentCustomer, customerCommentStore, handleCloseModal],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        toggleCommentModalOpen();
      }
    },
    [toggleCommentModalOpen],
  );

  const isShowMoreVisible = visibleComments.length < customerCommentStore.values.length;

  return (
    <>
      <CustomerCommentModal
        isOpen={isCommentModalOpen}
        onClose={handleCloseModal}
        onFormSubmit={handleCommentSubmit}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        cancelButton="Cancel"
        submitButton="Delete Comment"
        title="Delete Comment"
        subTitle="Are you sure you want to delete this comment?"
        onCancel={toggleDeleteModalOpen}
        onSubmit={handleCommentDelete}
      />
      <div className={styles.sectionHeader}>
        <Typography variant="bodyLarge" fontWeight="bold">
          Comments
        </Typography>
        <Typography
          color="information"
          role="button"
          tabIndex={0}
          onClick={toggleCommentModalOpen}
          onKeyDown={handleKeyDown}
        >
          + Add new comment
        </Typography>
      </div>
      {visibleComments.map(commentValue => (
        <Comment
          key={commentValue.id}
          comment={commentValue}
          onDelete={handleDeleteClick}
          onEdit={handleEditClick}
        />
      ))}
      {isShowMoreVisible ? (
        <Typography
          className={styles.showMoreLink}
          color="information"
          onClick={handleShowMoreClick}
        >
          {t('Text.ShowMoreComments')}
        </Typography>
      ) : null}
    </>
  );
};

export default observer(CommentsSection);
