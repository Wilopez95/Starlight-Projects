import React, { useCallback, useEffect, useRef } from 'react';
import { DropEvent, FileRejection } from 'react-dropzone';
import { FileUpload, Layouts } from '@starlightpro/shared-components';

import { isImageFile, isPdfFile } from '@root/helpers';

import { FilePreviewIcon } from '../FilePreviewIcon/FilePreviewIcon';
import { FilesGallery } from '../FilesGallery/FilesGallery';
import { IFilesGalleryHandle } from '../FilesGallery/types';

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

    const isPdf = isPdfFile(file);

    if (isImageFile(file) || isPdf) {
      const url = URL.createObjectURL(file);

      Object.assign(file, { imagePreview: url, isPdf });
      imageObjectUrls.current.push(url);
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  return (
    <>
      <Layouts.Flex justifyContent="flex-start" $wrap>
        {props.data.map((previewProps, index) => (
          <Layouts.Margin top="1" right="1" key={index}>
            <FilePreviewIcon
              {...previewProps}
              size="small"
              onRemoveClick={props.modifiable ? () => props.onRemove(index) : undefined}
              onClick={() => galleryHandleRef.current?.handleOpen(index)}
            />
          </Layouts.Margin>
        ))}
        {props.modifiable && props.onFileAdded && props.onFileRejected ? (
          <Layouts.Margin top="1">
            <FileUpload
              size="small"
              acceptMimeTypes={props.acceptMimeTypes}
              onDropAccepted={handleFileAccepted}
              onDropRejected={handleFileRejection}
            />
          </Layouts.Margin>
        ) : null}
      </Layouts.Flex>
      <FilesGallery
        media={props.data}
        ref={galleryHandleRef}
        onRemove={props.modifiable ? handleRemove : undefined}
      />
    </>
  );
};
