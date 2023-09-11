import React, { useCallback, useEffect, useRef } from 'react';
import { InputContainer, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { CancelAltIcon, DownloadIcon, InvoicePreview } from '@root/assets';
import { acceptableMimeTypes } from '@root/helpers';
import { useBoolean } from '@root/hooks';

import { FilePreviewModal } from '../FilePreview';
import { Typography } from '../Typography/Typography';

import * as Styles from './styles';
import { IFileInput } from './types';

export const FileInput: React.FC<IFileInput> = ({
  label,
  onChange,
  error,
  value,
  name,
  acceptMimeTypes = acceptableMimeTypes,
}) => {
  const formik = useFormikContext<unknown>();
  const [isPreviewModalOpen, openPreviewModal, closePreviewModal] = useBoolean(false);
  const previewUrl = useRef<string | undefined>(undefined);

  const setFieldError = formik?.setFieldError ?? noop;

  useEffect(() => {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = undefined;
    }

    if (value) {
      previewUrl.current = URL.createObjectURL(value);
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldError(name, undefined);
      const file = e.target.files?.[0];

      if (!file) {
        return;
      }

      onChange(name, file);
    },
    [name, onChange, setFieldError],
  );

  const handleReset = useCallback(() => {
    onChange(name, undefined);
  }, [name, onChange]);

  if (value) {
    return (
      <InputContainer error={error}>
        <FilePreviewModal
          src={previewUrl.current}
          isOpen={isPreviewModalOpen}
          onClose={closePreviewModal}
          category="media"
          fileName={value?.name ?? ''}
        />
        <Layouts.Flex>
          <Layouts.IconLayout disableFill right="0" height="14px" width="12px">
            <InvoicePreview />
          </Layouts.IconLayout>
          <Layouts.Margin right="1" left="1">
            <Typography cursor="pointer" color="information" onClick={openPreviewModal}>
              {value?.name ?? ''}
            </Typography>
          </Layouts.Margin>
          <Layouts.IconLayout onClick={handleReset} height="16px" width="16px">
            <CancelAltIcon />
          </Layouts.IconLayout>
        </Layouts.Flex>
      </InputContainer>
    );
  }

  return (
    <InputContainer error={error}>
      <Styles.FileInputLabel as="label" alignItems="center">
        <input
          type="file"
          name={name}
          onChange={handleChange}
          accept={acceptMimeTypes?.join(',')}
        />
        <Layouts.IconLayout>
          <DownloadIcon />
        </Layouts.IconLayout>
        <Typography cursor="pointer" color="information">
          {label}
        </Typography>
      </Styles.FileInputLabel>
    </InputContainer>
  );
};
