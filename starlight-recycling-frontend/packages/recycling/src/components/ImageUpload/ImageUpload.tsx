import React, { FC, useCallback } from 'react';
import cs from 'classnames';
import { Trans } from '../../i18n';
import { useDropzone } from 'react-dropzone';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import ControlPointIcon from '@material-ui/icons/ControlPoint';

import { ContentLoader } from '@starlightpro/common';
import { useUploadFileMutation } from '../../graphql/api';
import { showSuccess, showError } from '../../components/Toast';

interface ImageUploadProps {
  imageUrl: string | null;
  pathEntries?: string[];
  className?: string;
  onChange: (imageUrl: string | null) => void;
  onDelete: (imageUrl: string | null) => void;
}

const useStyles = makeStyles(
  ({ spacing, palette, shape, transitions }) => ({
    root: {
      width: 263,
      height: 300,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
    },

    actionsWrapper: {
      display: 'none',
      opacity: 0,
      justifyContent: 'space-between',
      transition: transitions.create('opacity', {
        duration: transitions.duration.shorter,
      }),
    },
    dropzoneWrapper: {
      position: 'relative',
      height: 263,
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      padding: spacing(3),
      border: `1px solid ${palette.grey[400]}`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',

      '&:before': {
        zIndex: 10,
        content: '"\\00a0"',
        pointerEvents: 'none', // Transparent to the hover style.
        position: 'absolute',
        top: -1,
        right: -1,
        left: -1,
        bottom: -1,
        border: `2px solid ${palette.grey[400]}`,
        borderRadius: shape.borderRadius,
        opacity: 0,
        transition: transitions.create('opacity', {
          duration: transitions.duration.shorter,
        }),
      },

      '&$dragActive:before': {
        opacity: 1,
      },
    },
    iconWrapper: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadIcon: {
      width: 62,
      height: 62,
      color: palette.grey[300],
    },
    uploadBtn: {
      color: palette.success.main,
      display: 'none',
    },
    deleteBtn: {
      color: palette.error.main,
    },
    dragActive: {},
    dragReject: {
      '&:before': {
        borderColor: palette.error.main,
      },
    },
    dragAccept: {
      '&:before': {
        borderColor: palette.primary.main,
      },
    },
    withFile: {
      '& $actionsWrapper': {
        opacity: 1,
      },
    },
  }),
  { name: 'ImageUpload' },
);

const ImageUpload: FC<ImageUploadProps> = ({
  imageUrl = null,
  onChange,
  onDelete,
  pathEntries = [],
}) => {
  const classes = useStyles();
  const [uploadImage, { loading }] = useUploadFileMutation();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      try {
        const result = await uploadImage({
          variables: {
            file: acceptedFiles[0],
            pathEntries,
          },
        });

        if (result.data?.uploadFile && onChange) {
          onChange(result.data?.uploadFile.url);
        }

        showSuccess(<Trans>Image Uploaded</Trans>);
      } catch (e) {
        showError(<Trans>Failed to upload image</Trans>);
      }
    },
    [onChange, pathEntries, uploadImage],
  );

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    isDragAccept,
    isDragReject,
    draggedFiles,
  } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: 'image/jpeg, image/png',
    disabled: true,
  });

  const emptyContent = (
    <>
      <Box className={classes.iconWrapper}>
        <ControlPointIcon className={classes.uploadIcon} />
      </Box>
      <Button variant="outlined" onClick={open} className={classes.uploadBtn}>
        <Trans>Upload Logo</Trans>
      </Button>
    </>
  );

  return (
    <Box className={cs(classes.root, { [classes.withFile]: !!imageUrl })}>
      {loading && <ContentLoader expanded />}
      <Box className={classes.actionsWrapper}>
        <Button
          size="small"
          startIcon={<GetAppIcon />}
          onClick={open}
          disabled={!imageUrl}
          className={classes.uploadBtn}
        >
          <Trans>Upload New</Trans>
        </Button>
        <Button
          size="small"
          disabled={!imageUrl}
          startIcon={<DeleteIcon />}
          onClick={() => onDelete && onDelete(imageUrl)}
          className={classes.deleteBtn}
        >
          <Trans>Delete</Trans>
        </Button>
      </Box>
      <div
        {...getRootProps({
          className: cs(classes.dropzoneWrapper, {
            [classes.dragActive]: isDragActive || draggedFiles.length > 0,
            [classes.dragAccept]: isDragAccept,
            [classes.dragReject]: isDragReject,
          }),
          style: {
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          },
        })}
      >
        <input {...getInputProps()} />
        {imageUrl ? null : emptyContent}
      </div>
    </Box>
  );
};

export default ImageUpload;
