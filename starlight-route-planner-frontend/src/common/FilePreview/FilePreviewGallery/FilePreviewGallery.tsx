import React, { useCallback, useEffect, useRef } from 'react';
import { DropEvent, FileRejection } from 'react-dropzone';
import { FileUpload, Layouts } from '@starlightpro/shared-components';

import { isImageFile, isPdfFile } from '@root/helpers';

import { FilePreviewIcon } from '../FilePreviewIcon/FilePreviewIcon';
import { FilesGallery } from '../FilesGallery/FilesGallery';
import { IFilesGalleryHandle } from '../FilesGallery/types';

import { CountBlock } from './styles';
import { FilePreviewGalleryProps } from './types';

export const FilePreviewGallery: React.FC<FilePreviewGalleryProps> = props => {
  const galleryHandleRef = useRef<IFilesGalleryHandle>(null);

  const imageObjectUrls = useRef<string[]>([]);

  const onFileAccepted = props.modifiable && props.onFileAdded;
  const handleFileAccepted = (files: File[]) => {
    if (!onFileAccepted || !files[0]) {
      return;
    }

    const [file] = files;

    if (isImageFile(file)) {
      const url = URL.createObjectURL(file);

      Object.assign(file, { imagePreview: url });
      imageObjectUrls.current.push(url);
    } else if (isPdfFile(file)) {
      Object.assign(file, { isPdf: true });
    }

    onFileAccepted(props.data.length, file);
  };

  const onFileRejected = props.modifiable && props.onFileRejected;
  const handleFileRejection = useCallback(
    (rejections: FileRejection[], event: DropEvent) => {
      if (onFileRejected) {
        onFileRejected(rejections[0], event);
      }
    },
    [onFileRejected],
  );

  const handleRemove = useCallback(() => {
    if (
      props.modifiable &&
      galleryHandleRef.current &&
      galleryHandleRef.current.activeIndex !== null
    ) {
      galleryHandleRef.current.handleClose();
      props.onRemove(galleryHandleRef.current.activeIndex);
    }
  }, [props]);

  useEffect(() => {
    const objectUrls = imageObjectUrls.current;

    return () => {
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  const canPreview =
    !!props.previewCount && !props.modifiable && props.data.length > props.previewCount;

  const items = canPreview ? props.data.slice(0, props.previewCount) : props.data;

  return (
    <Layouts.Box width="100%">
      <Layouts.Grid gap="1" alignItems="center" columns="repeat(auto-fit, 36px)">
        {items.map((previewProps, index) => (
          <FilePreviewIcon
            key={index}
            {...previewProps}
            size="small"
            onRemoveClick={props.modifiable ? () => props.onRemove(index) : undefined}
            onClick={() => galleryHandleRef.current?.handleOpen(index)}
          />
        ))}
        {props.modifiable && props.onFileAdded && props.onFileRejected ? (
          <FileUpload
            size="small"
            acceptMimeTypes={props.acceptMimeTypes}
            onDropAccepted={handleFileAccepted}
            onDropRejected={handleFileRejection}
          />
        ) : null}
        {canPreview && props.previewCount ? (
          <CountBlock>+{props.data.length - props.previewCount}</CountBlock>
        ) : null}
      </Layouts.Grid>
      <FilesGallery
        media={props.data}
        ref={galleryHandleRef}
        onRemove={props.modifiable ? handleRemove : undefined}
      />
    </Layouts.Box>
  );
};
