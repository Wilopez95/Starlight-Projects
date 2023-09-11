import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InputContainer, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { FilePreviewGallery, FilePreviewWithModal, FormInput, Typography } from '@root/common';
import { IEditableLandfillOperation } from '@root/types';

export const MediaSection: React.FC = () => {
  const { values, handleChange, errors } = useFormikContext<IEditableLandfillOperation>();
  const { t } = useTranslation();

  const mediaFiles = useMemo(() => {
    return values.mediaFiles.map((mediaFile, index) => {
      return {
        src: mediaFile,
        fileName: `Media file #${index}`,
        category: 'Media file',
      };
    });
  }, [values.mediaFiles]);

  return (
    <Layouts.Grid columns={5} gap="2">
      <Layouts.Cell width={5}>
        <Typography variant="headerThree">{t('Text.Images')}</Typography>
      </Layouts.Cell>
      <Layouts.Cell width={1}>
        <FormInput
          label={`${t('Text.Ticket')} #`}
          onChange={handleChange}
          value={values.ticketNumber}
          error={errors.ticketNumber}
          name="ticketNumber"
        />
      </Layouts.Cell>
      <Layouts.Cell width={2}>
        {values.ticketUrl ? (
          <InputContainer label={t('Text.Ticket')}>
            <FilePreviewWithModal
              src={values.ticketUrl}
              fileName={`Ticket from Landfill# ${values.id}`}
              category="Ticket"
              author={values.workOrder.ticketAuthor}
              timestamp={values.ticketDate ?? undefined}
              size="small"
            />
          </InputContainer>
        ) : null}
      </Layouts.Cell>

      <Layouts.Cell width={2}>
        {mediaFiles.length > 0 ? (
          <InputContainer label={t('Text.MediaFiles')}>
            <FilePreviewGallery data={mediaFiles} />
          </InputContainer>
        ) : null}
      </Layouts.Cell>
    </Layouts.Grid>
  );
};
