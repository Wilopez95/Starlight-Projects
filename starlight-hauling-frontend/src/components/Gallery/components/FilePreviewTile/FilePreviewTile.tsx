import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { DeleteIcon } from '@root/assets';
import { Typography } from '@root/common/Typography/Typography';

import { IFilePreviewTile } from './types';

import styles from './css/styles.scss';

const FilePreviewTile: React.FC<IFilePreviewTile> = ({
  file: { id, isImage, url, fileName, extension, createdAt },
  index,
  onDelete,
  onOpen,
}) => {
  const handleOpen = useCallback(() => {
    onOpen(index);
  }, [index, onOpen]);

  const handleDelete = useCallback(
    (e: React.SyntheticEvent): void => {
      e.stopPropagation();
      onDelete(id);
    },
    [id, onDelete],
  );

  return (
    <div className={styles.container} onClick={handleOpen}>
      <div className={styles.deleteIcon} onClick={handleDelete}>
        <DeleteIcon />
      </div>
      <Layouts.Box
        height="176px"
        backgroundColor={isImage ? undefined : 'primary'}
        backgroundShade={isImage ? undefined : 'desaturated'}
      >
        {isImage ? (
          <img src={url} alt={fileName} className={styles.image} />
        ) : (
          <Typography
            className={styles.fileExtension}
            color="primary"
            shade="light"
            textAlign="center"
          >
            {extension.substr(1).toUpperCase()}
          </Typography>
        )}
      </Layouts.Box>
      <Layouts.Padding top="1" right="1" left="2">
        <Typography shade="dark" ellipsis>
          {fileName}
        </Typography>
        <Layouts.Margin top="0.5">
          <Typography color="secondary" shade="light" variant="bodySmall">
            {createdAt.valueOf()}
          </Typography>
        </Layouts.Margin>
      </Layouts.Padding>
    </div>
  );
};

export default FilePreviewTile;
