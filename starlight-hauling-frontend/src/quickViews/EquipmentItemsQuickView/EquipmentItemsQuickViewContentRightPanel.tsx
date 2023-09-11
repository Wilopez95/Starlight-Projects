import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Checkbox, FileUpload, IFileUploadHandle, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { DeleteIcon, DownloadIcon } from '@root/assets';
import { FilePreviewModal, FormInput, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { handleEnterOrSpaceKeyDown, imageOnlyMimeTypes } from '@root/helpers';
import { useBusinessContext, useStores, useToggle, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { buildI18Path } from '@root/i18n/helpers';
import { EquipmentItemWithImage } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.EquipmentItems.QuickView.EquipmentItemsQuickView.',
);

export const EquipmentItemsQuickViewContentRightPanel: React.FC = () => {
  const { t } = useTranslation();
  const { equipmentItemStore, systemConfigurationStore, businessLineStore } = useStores();
  const { businessLineId } = useBusinessContext();
  const { currentUser } = useUserContext();

  const selectedEquipmentItem = equipmentItemStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;

  const isNew = isCreating || !selectedEquipmentItem;
  const isRollOffType = businessLineStore.isRollOffType(businessLineId);

  const isRecyclingEquipment = selectedEquipmentItem?.recyclingDefault;
  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const { values, errors, handleChange, setFieldValue, setFieldError } =
    useFormikContext<EquipmentItemWithImage>();

  const emptyWeightLabel = useMemo(
    () => t(`${I18N_PATH.Text}${isRecyclingLoB ? 'TareWeight' : 'EmptyWeight'}`),
    [isRecyclingLoB, t],
  );

  const fileUpload = useRef<IFileUploadHandle>(null);
  const imageObjectUrl: MutableRefObject<string | null> = useRef<string>(null);
  const [isImagePreviewModalOpen, toggleImagePreviewModal] = useToggle(false);

  const handleRemoveFile = useCallback(() => {
    setFieldValue('imageUrl', null);
    setFieldValue('image', null);
  }, [setFieldValue]);

  const handleFileInput = useCallback(
    ([image]: File[]) => {
      if (imageObjectUrl.current) {
        URL.revokeObjectURL(imageObjectUrl.current);
      }

      const imagePreview = URL.createObjectURL(image);

      imageObjectUrl.current = imagePreview;
      Object.assign(image, { imagePreview });

      setFieldValue('image', image);
      setFieldValue('imageUrl', null);
      setFieldError('image', undefined);
      setFieldError('imageUrl', undefined);
    },
    [setFieldValue, setFieldError],
  );

  const handleFileError = useCallback(
    (rejections: FileRejection[]) => {
      if (
        rejections.some(rejection =>
          rejection.errors.some(error => error.code === 'file-too-large'),
        )
      ) {
        setFieldError('image', t(`${I18N_PATH.ValidationErrors}FileTooLarge`));
      } else {
        setFieldError('image', t(`${I18N_PATH.ValidationErrors}PleaseOnlyUpload`));
      }
    },
    [t, setFieldError],
  );

  useEffect(
    () => () => {
      if (imageObjectUrl.current) {
        URL.revokeObjectURL(imageObjectUrl.current);
      }
    },
    [],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  const title =
    isNew || !values.description ? t(`${I18N_PATH.Text}CreateNewEquipment`) : values.description;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{title}</Typography>
        <Typography shade="light" variant="caption" textTransform="uppercase">
          {t(`${I18N_PATH.Text}Equipment`)}
        </Typography>
        <Divider both />
        <div className={styles.formContainer}>
          <Table>
            <tbody>
              <tr>
                <td className={styles.space}>{t('Text.Status')}</td>
                <td colSpan={9}>
                  <Checkbox
                    id="activeCheckbox"
                    value={values.active}
                    onChange={handleChange}
                    labelClass={styles.activeCheckbox}
                    name="active"
                    disabled={isRecyclingEquipment}
                  >
                    {t('Text.Active')}
                  </Checkbox>
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography
                    as="label"
                    htmlFor="shortDescription"
                    variant="bodyMedium"
                    shade="light"
                  >
                    {t('Text.ShortDescription')}*
                  </Typography>
                </td>
                <td colSpan={9}>
                  <FormInput
                    onChange={handleChange}
                    value={values.shortDescription}
                    name="shortDescription"
                    error={errors.shortDescription}
                    disabled={isRecyclingEquipment}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
                    {t('Text.Description')}*
                  </Typography>
                </td>
                <td colSpan={9}>
                  <FormInput
                    onChange={handleChange}
                    value={values.description}
                    name="description"
                    error={errors.description}
                    disabled={isRecyclingEquipment}
                  />
                </td>
              </tr>
              {!isRollOffType && !isRecyclingLoB ? (
                <tr>
                  <td colSpan={9} className={styles.space}>
                    <Checkbox
                      id="customerOwned"
                      value={values.customerOwned}
                      onChange={handleChange}
                      name="customerOwned"
                      disabled={isRecyclingEquipment}
                    >
                      {t(`${I18N_PATH.Text}CustomerOwnedEquipment`)}
                    </Checkbox>
                  </td>
                </tr>
              ) : null}
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="size" variant="bodyMedium" shade="light">
                    {t('Text.Size')}*
                  </Typography>
                </td>
                <td>
                  <Layouts.Box width="59px">
                    <FormInput
                      placeholder="0"
                      onChange={handleChange}
                      value={values.size ?? undefined}
                      name="size"
                      error={errors.size}
                      disabled={isRecyclingEquipment}
                    />
                  </Layouts.Box>
                </td>
                <td className={styles.space}>
                  {currentUser?.company?.unit === Units.metric
                    ? t(`${I18N_PATH.Text}CubicMeters`)
                    : t(`${I18N_PATH.Text}CubicYards`)}
                </td>
                <td className={styles.space} />
                <td className={styles.space}>
                  <Typography as="label" htmlFor="emptyWeight" variant="bodyMedium" shade="light">
                    {emptyWeightLabel}*
                  </Typography>
                </td>
                <td>
                  <Layouts.Box width="59px">
                    <FormInput
                      placeholder="0"
                      onChange={handleChange}
                      value={values.emptyWeight ?? undefined}
                      name="emptyWeight"
                      error={errors.emptyWeight}
                      disabled={isRecyclingEquipment}
                    />
                  </Layouts.Box>
                </td>
                <td className={styles.space}>
                  {currentUser?.company?.unit === Units.metric ? t('Text.Tonne') : t('Text.Tons')}
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="length" variant="bodyMedium" shade="light">
                    {t('Text.Length')}*
                  </Typography>
                </td>
                <td>
                  <Layouts.Box width="59px">
                    <FormInput
                      placeholder="0"
                      onChange={handleChange}
                      value={values.length ?? undefined}
                      name="length"
                      error={errors.length}
                      disabled={isRecyclingEquipment}
                    />
                  </Layouts.Box>
                </td>
                <td className={styles.space}>
                  {currentUser?.company?.unit === Units.metric ? t('Text.Meter') : t('Text.Feet')}
                </td>
                <td className={styles.space} />

                <td className={styles.space}>
                  <Typography as="label" htmlFor="width" variant="bodyMedium" shade="light">
                    {t('Text.Width')}*
                  </Typography>
                </td>
                <td>
                  <Layouts.Box width="59px">
                    <FormInput
                      placeholder="0"
                      onChange={handleChange}
                      value={values.width ?? undefined}
                      name="width"
                      error={errors.width}
                      disabled={isRecyclingEquipment}
                    />
                  </Layouts.Box>
                </td>
                <td className={styles.space}>
                  {currentUser?.company?.unit === Units.metric ? t('Text.Meter') : t('Text.Feet')}
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="height" variant="bodyMedium" shade="light">
                    {t('Text.Height')}*
                  </Typography>
                </td>
                <td>
                  <Layouts.Box width="59px">
                    <FormInput
                      placeholder="0"
                      onChange={handleChange}
                      value={values.height ?? undefined}
                      name="height"
                      error={errors.height}
                      disabled={isRecyclingEquipment}
                    />
                  </Layouts.Box>
                </td>
                <td className={styles.space}>
                  {currentUser?.company?.unit === Units.metric ? t('Text.Meter') : t('Text.Feet')}
                </td>
                <td />
                {isRollOffType && !isRecyclingEquipment ? (
                  <td colSpan={5} className={styles.space}>
                    <Checkbox
                      id="closedTopCheckbox"
                      value={values.closedTop}
                      onChange={handleChange}
                      name="closedTop"
                    >
                      {t(`${I18N_PATH.Text}ClosedTop`)}
                    </Checkbox>
                  </td>
                ) : null}
                {isRecyclingLoB ? (
                  <td colSpan={5} className={styles.space}>
                    <Checkbox
                      id="containerTareWeightRequiredCheckbox"
                      value={values.containerTareWeightRequired}
                      onChange={handleChange}
                      name="containerTareWeightRequired"
                      disabled={isRecyclingEquipment}
                    >
                      {t(`${I18N_PATH.Text}ContainerTareWeightRequired`)}
                    </Checkbox>
                  </td>
                ) : null}
              </tr>
              {!isRecyclingLoB ? (
                <>
                  <tr>
                    <td colSpan={10} className={styles.emptyCell}>
                      <Divider both />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={10} className={styles.label}>
                      {t(`${I18N_PATH.Text}ContractorAppImage`)}
                    </td>
                  </tr>
                  <tr className={styles.fileUploadContainer}>
                    <td colSpan={2}>
                      <div className={styles.fileUpload}>
                        <FileUpload
                          ref={fileUpload}
                          onDropAccepted={handleFileInput}
                          onDropRejected={handleFileError}
                          onPreviewOpen={toggleImagePreviewModal}
                          acceptMimeTypes={imageOnlyMimeTypes}
                          previewImage={values.imageUrl ?? values.image?.imagePreview}
                          error={!!errors.image || !!errors.imageUrl}
                        />
                        {values.imageUrl || values.image?.imagePreview ? (
                          <FilePreviewModal
                            src={(values.imageUrl ?? values.image?.imagePreview) as string}
                            onClose={toggleImagePreviewModal}
                            isOpen={isImagePreviewModalOpen}
                            category="equipment"
                            fileName=""
                          />
                        ) : null}
                        <div className={styles.fileUploadControls}>
                          <div
                            onClick={() => fileUpload.current?.open()}
                            className={styles.uploadButton}
                          >
                            <DownloadIcon
                              className={`${styles.uploadIcon} ${styles.fileActionIcon}`}
                            />
                            {t('Text.UploadNew')}
                          </div>
                          <div onClick={handleRemoveFile} className={styles.errorButton}>
                            <DeleteIcon
                              role="button"
                              tabIndex={0}
                              aria-label={t('Text.Delete')}
                              className={styles.fileActionIcon}
                              onKeyDown={e => handleKeyDown(e, handleRemoveFile)}
                            />
                            {t('Text.Delete')}
                          </div>
                        </div>
                      </div>
                      {!!errors.image || !!errors.imageUrl ? (
                        <Typography color="alert" variant="bodySmall">
                          {errors.image ?? errors.imageUrl}
                        </Typography>
                      ) : null}
                    </td>
                  </tr>
                </>
              ) : null}
            </tbody>
          </Table>
        </div>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};
