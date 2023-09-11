import React from 'react';

import { useToggle } from '@hooks';

import { FilePreviewIcon } from '../FilePreviewIcon/FilePreviewIcon';
import { FilePreviewModal } from '../FilePreviewModal/FilePreviewModal';

import { FilePreviewWithModalProps } from './types';

export const FilePreviewWithModal: React.FC<FilePreviewWithModalProps> = ({
  src,
  category,
  fileName,
  hideAuthor,
  downloadSrc,
  onRemoveClick,
  size,
  isPdf = false,
  author = null,
  timestamp = null,
}) => {
  const [isModalOpen, toggleModalOpen] = useToggle();

  return (
    <>
      <FilePreviewIcon
        src={src}
        category={category}
        fileName={fileName}
        isPdf={isPdf}
        size={size}
        onClick={toggleModalOpen}
        onRemoveClick={onRemoveClick}
      />

      <FilePreviewModal
        src={src}
        category={category}
        fileName={fileName}
        isPdf={isPdf}
        author={author}
        timestamp={timestamp}
        isOpen={isModalOpen}
        onClose={toggleModalOpen}
        downloadSrc={downloadSrc}
        hideAuthor={hideAuthor}
        withMeta
      />
    </>
  );
};
