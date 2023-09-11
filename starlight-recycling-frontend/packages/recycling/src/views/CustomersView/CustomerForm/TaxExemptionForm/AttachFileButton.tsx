import React, { useCallback } from 'react';
import { Field, FieldInputProps } from 'react-final-form';
import { ContentLoader } from '@starlightpro/common';
import { Trans } from '../../../../i18n';

import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Input from '@material-ui/core/Input';
import { useDeleteFileMutation, useUploadFileMutation } from '../../../../graphql/api';
import { showError } from '../../../../components/Toast';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { PDF_FILE } from '../../../../constants/regex';
import { TaxExemptionFormInput } from '../NewCustomerView';

const useStyles = makeStyles(() => ({
  previewContainer: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  attachFile: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
}));

export interface AttachFileButtonProps {
  value: string;
  isActive: boolean;
  onAttachFileClick(): void;
  onChange(value: string): void;
  onDeleteClick(): void;
  inputProps?: FieldInputProps<HTMLInputElement>;
  group?: boolean;
}

export const AttachFileButton = React.forwardRef<HTMLInputElement, AttachFileButtonProps>(
  ({ group, value, onAttachFileClick, onDeleteClick, isActive, onChange, inputProps }, ref) => {
    const classes = useStyles();
    const [uploadImage, { loading: uploading }] = useUploadFileMutation();
    const [deleteImage, { loading: deleting }] = useDeleteFileMutation();

    const removeImage = useCallback<(fileUrl: string) => Promise<void>>(
      async (fileUrl) => {
        try {
          await deleteImage({
            variables: {
              fileUrl,
            },
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          showError(<Trans>Failed to delete image</Trans>);
        }
      },
      [deleteImage],
    );

    const addImage = useCallback<(file: File) => Promise<string | undefined>>(
      async (file) => {
        try {
          const result = await uploadImage({
            variables: {
              file,
              pathEntries: ['taxExemptions'],
            },
          });

          return result.data?.uploadFile.url;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          showError(<Trans>Failed to upload image</Trans>);
        }
      },
      [uploadImage],
    );

    return (
      <>
        {value ? (
          <Box display="flex" alignItems="center">
            <Field name="taxExemptions" subscription={{ value: true }}>
              {({ input: { value: taxExemptions } }) => (
                <IconButton
                  disabled={deleting}
                  onClick={async () => {
                    const exemptionsWithSameImage = taxExemptions.filter(
                      (exemption: TaxExemptionFormInput) => exemption.fileUrl === value,
                    );

                    if (group || exemptionsWithSameImage.length === 1) {
                      await removeImage(value);
                    }

                    onDeleteClick();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Field>

            <Box className={classes.previewContainer} width={36} height={36}>
              {deleting ? (
                <ContentLoader expanded />
              ) : PDF_FILE.test(value) ? (
                <PictureAsPdfIcon />
              ) : (
                <img className={classes.image} src={value} alt="preview" />
              )}
            </Box>
          </Box>
        ) : (
          <Button
            type="button"
            color="primary"
            startIcon={!uploading && <AddIcon />}
            onClick={onAttachFileClick}
            disabled={uploading || !isActive}
          >
            {uploading ? <ContentLoader expanded /> : <Trans>Attach File</Trans>}
          </Button>
        )}
        <Input
          className={classes.attachFile}
          inputRef={ref}
          {...inputProps}
          value=""
          onChange={async (e) => {
            if ((e.target as HTMLInputElement).files!.length === 0) {
              return;
            }
            const file = (e.target as HTMLInputElement).files![0];

            const url = await addImage(file);

            if (url) {
              onChange(url);
            }
          }}
          disabled={!isActive}
          type="file"
          inputProps={{ accept: '.png, .jpg, .jpeg, .pdf' }}
        />
      </>
    );
  },
);

export default AttachFileButton;
