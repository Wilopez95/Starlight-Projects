import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { EmptyValuePlaceholder, FilePreviewGallery } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { IMedia } from '@root/types';

interface IProps {
  previewCount: number;
  media?: IMedia[];
}

const I18N_PATH_ROOT = 'Text.';

export const MediaFilesSection: React.FC<IProps> = ({ previewCount, media }) => {
  const { t } = useTranslation();

  const filesPreviewMediaData = useMemo(() => {
    return media?.map(mediaFile => {
      return {
        src: mediaFile.url,
        author: mediaFile.author,
        timestamp: mediaFile.timestamp ? new Date(+mediaFile.timestamp) : undefined,
        fileName: mediaFile.fileName ?? 'unknown',
        category: 'Media file',
      };
    });
  }, [media]);

  return (
    <>
      <Layouts.Margin top="2">
        <Layouts.Grid columns="120px auto" rowGap="1" alignItems="center">
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {t(`${I18N_PATH_ROOT}MediaFiles`)}
          </Typography>
          <Layouts.Flex alignItems="center">
            {media ? (
              <FilePreviewGallery data={filesPreviewMediaData ?? []} previewCount={previewCount} />
            ) : (
              <EmptyValuePlaceholder />
            )}
          </Layouts.Flex>
        </Layouts.Grid>
      </Layouts.Margin>
      <Layouts.Margin top="2">
        <Divider />
      </Layouts.Margin>
    </>
  );
};
