import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import Loader from '../Loader/Loader';

const I18N_PATH = 'components.Gallery.components.FileLoader.FileLoader.Text.';

const FilesLoader: React.FC<{ uploadingFilesCount: number }> = ({ uploadingFilesCount }) => {
  const { t } = useTranslation();

  if (!uploadingFilesCount) {
    return null;
  }

  return (
    <Layouts.Flex alignItems="center">
      <Layouts.Margin right="1">
        <Loader />
      </Layouts.Margin>
      {uploadingFilesCount}{' '}
      {t(`${I18N_PATH}FileUploading${uploadingFilesCount > 1 ? '_plural' : ''}`)}...
    </Layouts.Flex>
  );
};

export default FilesLoader;
