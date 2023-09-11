import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type FileRejection } from 'react-dropzone';
import { FileUpload, IFileUploadHandle, Layouts } from '@starlightpro/shared-components';
import { FormikErrors, getIn, useFormikContext } from 'formik';

import { DownloadIcon, PdfPlaceholderIcon } from '@root/assets';
import { FormInput, Switch, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import ConfirmModal from '@root/components/modals/Confirm/Confirm';
import { buildPath, isImageFile, isPdfFile, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useToggle, useUserContext } from '@root/hooks';
import { type ITaxDistrict } from '@root/types';

import ExemptionPreviewModal from '../../modals/ExemptionPreviewModal/ExemptionPreviewModal';

import FormSkeleton from './FormSkeleton';
import { type FormikTaxExemption } from './types';

import styles from './css/styles.scss';

interface ITaxExemptionForm {
  taxDistricts: ITaxDistrict[];
  loading: boolean;
  basePath?: string;
  groupExemptedByDefault?: boolean;
  districtsExemptedByDefault?: number[];
}

const attachmentMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const TaxExemptionForm: React.FC<ITaxExemptionForm> = ({
  taxDistricts,
  loading,
  basePath: basePathProp,
  groupExemptedByDefault,
  districtsExemptedByDefault,
}) => {
  const { values, errors, handleChange, setFieldValue, setErrors, setFieldError } =
    useFormikContext<FormikTaxExemption>();
  const { currentUser } = useUserContext();
  const imageObjectUrls = useRef<string[]>([]);
  const nonGroupFileUploads = useRef<(IFileUploadHandle | null)[]>([]);
  const groupFileUpload = useRef<IFileUploadHandle>(null);
  const [isImagePreviewModalOpen, toggleImagePreviewModal] = useToggle(false);
  const [isConfirmModalOpen, toggleConfirmModal] = useToggle(false);
  const [currentIndex, setCurrentIndex] = useState<number>();
  const [isFileInvalid, setIsFileInvalid] = useState(false);
  const basePath = useMemo(() => (basePathProp ? [basePathProp] : []), [basePathProp]);

  useEffect(() => {
    const objectUrls = imageObjectUrls.current;

    return () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  const handleFileInput = useCallback(
    ([file]: File[], index?: number) => {
      if (currentUser) {
        if (isImageFile(file)) {
          const url = URL.createObjectURL(file);

          Object.assign(file, { imagePreview: url });
          imageObjectUrls.current.push(url);
        } else if (isPdfFile(file)) {
          Object.assign(file, { isPdf: true });
        }

        const getFieldPath = (fieldName: string) =>
          buildPath(index === undefined ? fieldName : `nonGroup[${index}].${fieldName}`, basePath);

        setFieldValue(getFieldPath('image'), file);
        setFieldError(getFieldPath('image'), undefined);
        setFieldValue(getFieldPath('imageUrl'), null);
        setFieldValue(getFieldPath('timestamp'), new Date());
        setFieldValue(getFieldPath('author'), `${currentUser.firstName} ${currentUser.lastName}`);
      }
    },
    [basePath, currentUser, setFieldValue, setFieldError],
  );

  const handleFileError = useCallback((rejections: FileRejection[]) => {
    setIsFileInvalid(true);
    if (
      rejections.some(rejection => rejection.errors.some(error => error.code === 'file-too-large'))
    ) {
      NotificationHelper.error('images', ActionCode.FILE_TOO_LARGE);
    } else if (
      rejections.some(rejection =>
        rejection.errors.some(error => error.code === 'file-invalid-type'),
      )
    ) {
      NotificationHelper.error('images', ActionCode.INVALID_MIME_TYPE);
    }
  }, []);

  const handleDeleteFile = (index?: number) => {
    setFieldValue(
      buildPath(index === undefined ? 'image' : `nonGroup[${index}].image`, basePath),
      null,
    );
    setFieldValue(
      buildPath(index === undefined ? 'imageUrl' : `nonGroup[${index}].imageUrl`, basePath),
      null,
    );

    toggleConfirmModal();
    toggleImagePreviewModal();
  };

  const handleUploadFile = (index?: number) => {
    toggleImagePreviewModal();

    if (index !== undefined) {
      nonGroupFileUploads.current?.[index]?.open();
    } else {
      groupFileUpload.current?.open();
    }
  };

  const handleGroupEnabledChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrors({});
      setFieldValue(e.target.name, e.target.checked);
    },
    [handleChange, setErrors],
  );

  const handleNonGroupItemEnabledChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      setFieldError(buildPath(`nonGroup[${index}].authNumber`, basePath), undefined);
      handleChange(e);
    },
    [basePath, handleChange, setFieldError],
  );

  const handlePreviewOpen = (index?: number) => {
    setCurrentIndex(index);
    toggleImagePreviewModal();
  };

  const getFileUploadPlaceholder = (isPdf?: boolean, preview?: string | null) => {
    if (isPdf) {
      return <PdfPlaceholderIcon />;
    } else if (!preview) {
      return <DownloadIcon />;
    }

    return null;
  };

  // TODO: fix hack with isCloudinary checking
  const getFilePreview = (imageUrl?: string | null, preview?: string) => {
    const isCloudinary = imageUrl?.includes('https://res.cloudinary.com');

    const extension = isCloudinary ? '.png' : '';
    const imagePreview = preview ?? imageUrl;

    return imagePreview ? `${imagePreview}${extension}` : '';
  };

  const isNonGroupExempted = (districtId: number) =>
    districtsExemptedByDefault?.includes(districtId);

  const taxExemptionValues = getIn(values, [...basePath]) as FormikTaxExemption;
  const taxExemptionErrors = getIn(errors, [...basePath]) as FormikErrors<FormikTaxExemption>;
  const groupExemptionEnabled = taxExemptionValues.enabled;
  const isGroupExemptionFilePdf =
    taxExemptionValues.image?.isPdf ?? taxExemptionValues.imageUrl?.endsWith('.pdf');
  const groupExemptionPreview = getFilePreview(
    taxExemptionValues.imageUrl,
    taxExemptionValues.image?.imagePreview,
  );
  const nonGroupPreviewExemption =
    currentIndex === undefined ? undefined : taxExemptionValues.nonGroup?.[currentIndex];

  return (
    <>
      {loading ? (
        <FormSkeleton />
      ) : (
        <Layouts.Grid columnGap="2" columns="2fr 80px 1fr">
          {nonGroupPreviewExemption || groupExemptionPreview ? (
            <ExemptionPreviewModal
              actionsDisabled={
                nonGroupPreviewExemption
                  ? !nonGroupPreviewExemption.enabled ||
                    (isNonGroupExempted(nonGroupPreviewExemption.taxDistrictId) ??
                      groupExemptionEnabled) ||
                    !!groupExemptedByDefault
                  : groupExemptedByDefault ?? !groupExemptionEnabled
              }
              src={
                nonGroupPreviewExemption
                  ? getFilePreview(
                      nonGroupPreviewExemption?.imageUrl,
                      nonGroupPreviewExemption?.image?.imagePreview,
                    )
                  : groupExemptionPreview
              }
              author={
                nonGroupPreviewExemption
                  ? nonGroupPreviewExemption.author
                  : taxExemptionValues.author
              }
              timestamp={
                nonGroupPreviewExemption
                  ? nonGroupPreviewExemption.timestamp
                  : taxExemptionValues.timestamp
              }
              onClose={toggleImagePreviewModal}
              isOpen={isImagePreviewModalOpen}
              isPdf={nonGroupPreviewExemption?.image?.isPdf}
              onFileDelete={toggleConfirmModal}
              onFileUpload={() => handleUploadFile(currentIndex)}
            />
          ) : null}
          <ConfirmModal
            isOpen={isConfirmModalOpen}
            cancelButton="Cancel"
            submitButton="Delete"
            title="Delete File"
            subTitle="Are you sure you want to delete this file?"
            overlayClassName={styles.confirmModalOverlay}
            onCancel={toggleConfirmModal}
            onSubmit={() => {
              handleDeleteFile(currentIndex);
            }}
          />
          <Layouts.Margin bottom="1">
            <Layouts.Flex>
              <Typography color="secondary">Exempt</Typography>
              <Layouts.Margin left="5">
                <Typography color="secondary">Tax District</Typography>
              </Layouts.Margin>
            </Layouts.Flex>
          </Layouts.Margin>
          <Typography color="secondary">File</Typography>
          <Typography color="secondary">Auth#</Typography>
          <Switch
            name={buildPath(`enabled`, basePath)}
            onChange={handleGroupEnabledChange}
            value={groupExemptedByDefault ?? taxExemptionValues.enabled}
            labelClass={styles.spaceTop}
            readOnly={groupExemptedByDefault}
            disabled={groupExemptedByDefault}
          >
            <Layouts.Margin left="5">All Tax Districts</Layouts.Margin>
          </Switch>
          <Layouts.Flex>
            {groupExemptionPreview ||
            isGroupExemptionFilePdf ||
            (groupExemptionEnabled && !groupExemptedByDefault) ? (
              <FileUpload
                ref={groupFileUpload}
                size="small"
                className={styles.fileUpload}
                acceptMimeTypes={attachmentMimeTypes}
                onDropAccepted={files => handleFileInput(files)}
                onDropRejected={handleFileError}
                previewImage={groupExemptionPreview}
                isPdf={isGroupExemptionFilePdf}
                placeholder={getFileUploadPlaceholder(
                  isGroupExemptionFilePdf,
                  groupExemptionPreview,
                )}
                onPreviewOpen={() => handlePreviewOpen()}
                error={isFileInvalid}
              />
            ) : null}
          </Layouts.Flex>
          <FormInput
            name={buildPath(`authNumber`, basePath)}
            ariaLabel="Authentication number"
            onChange={handleChange}
            value={taxExemptionValues.authNumber ?? ''}
            error={getIn(taxExemptionErrors, 'authNumber')}
            disabled={groupExemptedByDefault ?? !taxExemptionValues.enabled}
          />
          <Layouts.Cell width={3}>
            <Divider bottom />
          </Layouts.Cell>
          {taxExemptionValues.nonGroup?.map((item, i) => {
            const district = taxDistricts.find(dist => dist.id === item.taxDistrictId);
            const isPdf = item.image?.isPdf ?? item.imageUrl?.endsWith('.pdf');
            const preview = getFilePreview(item.imageUrl, item.image?.imagePreview);
            const disabled =
              isNonGroupExempted(item.taxDistrictId) ??
              groupExemptedByDefault ??
              groupExemptionEnabled;

            return (
              district && (
                <React.Fragment key={item.taxDistrictId}>
                  <Switch
                    name={buildPath(`nonGroup[${i}].enabled`, basePath)}
                    onChange={e => handleNonGroupItemEnabledChange(e, i)}
                    value={isNonGroupExempted(item.taxDistrictId) ?? item.enabled}
                    labelClass={styles.spaceTop}
                    readOnly={disabled}
                    disabled={disabled}
                  >
                    <Layouts.Margin left="5">{district?.description}</Layouts.Margin>
                  </Switch>
                  <Layouts.Flex>
                    {preview ||
                    isPdf ||
                    (item.enabled &&
                      !groupExemptionEnabled &&
                      !groupExemptedByDefault &&
                      !isNonGroupExempted(item.taxDistrictId)) ? (
                      <FileUpload
                        ref={el => (nonGroupFileUploads.current[i] = el)}
                        className={styles.fileUpload}
                        size="small"
                        acceptMimeTypes={attachmentMimeTypes}
                        onDropAccepted={files => handleFileInput(files, i)}
                        onDropRejected={handleFileError}
                        previewImage={preview}
                        isPdf={isPdf}
                        placeholder={getFileUploadPlaceholder(isPdf, preview)}
                        onPreviewOpen={() => handlePreviewOpen(i)}
                        error={isFileInvalid}
                      />
                    ) : null}
                  </Layouts.Flex>
                  <FormInput
                    name={buildPath(`nonGroup[${i}].authNumber`, basePath)}
                    ariaLabel="Non group authentication number"
                    onChange={handleChange}
                    value={item.authNumber ?? ''}
                    error={getIn(taxExemptionErrors, `nonGroup[${i}].authNumber`)}
                    disabled={!item.enabled || disabled}
                  />
                </React.Fragment>
              )
            );
          })}
        </Layouts.Grid>
      )}
    </>
  );
};

export default TaxExemptionForm;
