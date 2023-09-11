import React, { useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { TicketIcon } from '@root/assets';
import { FilesGallery } from '@root/common';
import { IFilesGalleryHandle } from '@root/common/FilePreview/FilesGallery/types';

import { ILandfillMediaSection } from './types';

const LandfillMediaSection: React.FC<ILandfillMediaSection> = ({ landfillOperation }) => {
  const galleryRef = useRef<IFilesGalleryHandle>(null);

  const handleOpen = useCallback(() => {
    galleryRef.current?.handleOpen();
  }, []);

  const mediaFiles = landfillOperation.mediaFilesData;

  return (
    <>
      <TicketIcon onClick={handleOpen} data-skip-event />
      <FilesGallery media={mediaFiles} ref={galleryRef} />
    </>
  );
};

export default observer(LandfillMediaSection);
