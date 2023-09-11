import React, { FC, useCallback, useMemo } from 'react';
import clx from 'classnames';
import Image from 'material-ui-image';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { useField } from 'react-final-form';
import { useDropzone } from 'react-dropzone';
import { Box, Grid, IconButton, makeStyles, Typography } from '@material-ui/core';

import { OrderImageInput, useUploadFileMutation } from '../../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../../types';
import { Theme } from '@material-ui/core/styles';
import { PDF_FILE } from '../../../../constants/regex';
import { showError } from '../../../../components/Toast';
import { Trans } from '../../../../i18n';
import imageCompression from 'browser-image-compression';

const IMG_CONTAINER_DEFAULT_SIZE = '120px';

const useStyles = makeStyles<Theme, Props>((theme) => ({
  gridContainer: {
    justifyContent: (props) => props.alignGridItems ?? 'flex-start',
  },
  dropzone: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    border: '1px dashed rgba(0, 0, 0, 0.24)',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  dropzoneIcon: {
    color: 'rgba(0, 0, 0, 0.48)',
  },
  imageContainer: {
    width: (props) => props.imageContainerSize ?? IMG_CONTAINER_DEFAULT_SIZE,
    height: (props) => props.imageContainerSize ?? IMG_CONTAINER_DEFAULT_SIZE,
    position: 'relative',
  },
  pdfContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  deleteIcon: {
    position: 'absolute',
    color: theme.palette.secondary.main,
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 0,
    background: theme.palette.common.white,
    borderRadius: 0,
    '&:hover': {
      background: theme.palette.common.white,
    },
  },
  image: {
    position: 'absolute',
    borderRadius: '5px',
    objectFit: 'cover',
  },
}));

interface ImageData {
  url: string;
  filename: string;
}

interface Props extends ReadOnlyOrderFormComponent {
  orderId: number;
  hideTitle?: boolean;
  maxCount?: number;
  imageContainerSize?: any;
  alignGridItems?: 'flex-start' | 'flex-end';
}

const name = 'images';

export const ImagesContainer: FC<Props> = (props) => {
  const { orderId, readOnly, hideTitle, maxCount } = props;
  const classes = useStyles(props);
  const {
    input: { value, onChange },
  } = useField<ImageData[]>(name, { subscription: { value: true } });

  const [uploadFile] = useUploadFileMutation();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const files = acceptedFiles.slice(0, maxCount);
        let values = [...value];

        for (const file of files) {
          if (!(file instanceof File)) {
            return;
          }

          onChange({
            target: { name, value: [...values, { filename: file.name, url: '' }] },
          });
          const compressedFile = await imageCompression(file, { maxSizeMB: 10 });

          const response = await uploadFile({
            variables: {
              file: compressedFile,
              pathEntries: ['order', `${orderId}`, 'image'],
            },
          });

          const { url, filename } = response.data?.uploadFile!;
          const image = { url, filename };
          values = [...values, image];

          onChange({
            target: { name, value: values },
          });
        }
      } catch (e) {
        showError(<Trans>Failed to upload image</Trans>);
      }
    },
    [uploadFile, orderId, onChange, value, maxCount],
  );

  const onImageDelete = (image: ImageData) => {
    onChange({
      target: {
        name,
        value: value.reduce((res, item) => {
          if (item !== image) {
            res.push(item);
          }

          return res;
        }, [] as ImageData[]),
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ['.png', '.jpeg', '.jpg', '.pdf'],
  });

  const hideAdd = useMemo(() => {
    if (readOnly) {
      return true;
    }

    return maxCount != null && maxCount <= (value || []).length;
  }, [maxCount, readOnly, value]);

  return (
    <>
      {!hideTitle && (
        <Typography variant="h6">
          <Trans>Images</Trans>
        </Typography>
      )}
      <Box display="flex">
        <Grid className={classes.gridContainer} container spacing={2}>
          {(value || []).map((image: OrderImageInput, i: number) => {
            const isPdf = PDF_FILE.test(image.url);

            return (
              <Grid
                key={i}
                item
                className={clx(classes.imageContainer, {
                  [classes.imageContainer]: isPdf,
                })}
              >
                {!readOnly && (
                  <IconButton className={classes.deleteIcon} onClick={() => onImageDelete(image)}>
                    <DeleteIcon />
                  </IconButton>
                )}
                {isPdf ? <PictureAsPdfIcon /> : <Image src={image.url} className={classes.image} />}
              </Grid>
            );
          })}
          {!hideAdd && (
            <Grid className={classes.imageContainer} item {...getRootProps()}>
              <Box className={classes.dropzone}>
                <input {...getInputProps()} />
                <AddIcon fontSize="large" className={classes.dropzoneIcon} />
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
};
