import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Button, FileUpload, IFileUploadHandle } from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { DeleteIcon, DownloadIcon, LogoPlaceholder, PlusCircle } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { IBusinessUnit } from '@root/types';

import sectionStyles from '../css/styles.scss';
import styles from './css/styles.scss';

const attachmentMimeTypes = ['image/jpeg', 'image/png'];

const I18N_PATH_BASE = 'pages.SystemConfiguration.tables.BusinessUnit.sections.LogoInformation.';
const I18N_PATH_TEXT = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_PATH_BASE}Form.`;

const Section: React.FC = () => {
  const { t } = useTranslation();
  const fileUpload = useRef<IFileUploadHandle>(null);
  const imageObjectUrl: MutableRefObject<string | null> = useRef<string>(null);

  const { values, errors, setValues, setFieldError, setFormikState, handleChange } =
    useFormikContext<IBusinessUnit>();

  const preview = useMemo(
    () =>
      values.logoUrl
        ? `${values.logoUrl}?${new Date().getTime()}`
        : values.logo?.imagePreview ?? null,
    [values.logo?.imagePreview, values.logoUrl],
  );

  useEffect(
    () => () => {
      if (imageObjectUrl.current) {
        URL.revokeObjectURL(imageObjectUrl.current);
      }
    },
    [imageObjectUrl],
  );

  const handleFileInput = useCallback(
    ([image]: File[]) => {
      if (imageObjectUrl.current) {
        URL.revokeObjectURL(imageObjectUrl.current);
      }

      const imagePreview = URL.createObjectURL(image);

      imageObjectUrl.current = imagePreview;

      setFormikState(state => ({
        ...state,
        errors: {
          ...state.errors,
          logo: undefined,
          logoUrl: undefined,
        },
        values: {
          ...state.values,
          logo: Object.assign(image, { imagePreview }),
          logoUrl: undefined,
        },
      }));
    },
    [setFormikState],
  );

  const handleFileError = useCallback(
    (rejections: FileRejection[]) => {
      if (
        rejections.some(rejection =>
          rejection.errors.some(error => error.code === 'file-too-large'),
        )
      ) {
        setFieldError('logo', t(`${I18N_PATH_BASE}ValidationErrors.FileTooLarge`));
      } else if (
        rejections.some(rejection =>
          rejection.errors.some(error => error.code === 'file-invalid-type'),
        )
      ) {
        setFieldError('logo', t(`${I18N_PATH_TEXT}PleaseOnlyUpload`));
      }
    },
    [t, setFieldError],
  );

  const handleRemoveFile = useCallback(
    () =>
      setValues({
        ...values,
        logoUrl: null,
        logo: undefined,
      }),
    [setValues, values],
  );

  const fileUploadPlaceholder = !preview && (
    <div className={styles.uploadPlaceholder}>
      <PlusCircle className={styles.icon} />
      <Button className={styles.button} onClick={preview ? fileUpload.current?.open : undefined}>
        {t(`${I18N_PATH_TEXT}UploadLogo`)}
      </Button>
    </div>
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleRemoveFile();
      }
    },
    [handleRemoveFile],
  );

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.content}>
        <div className={cx(sectionStyles.row, sectionStyles.spaceBottom, sectionStyles.small)}>
          <div className={sectionStyles.column}>
            <div
              className={cx(
                styles.fileUploadActions,
                sectionStyles.spaceBottom,
                sectionStyles.small,
              )}
            >
              {preview ? (
                <>
                  <Typography
                    color="information"
                    onClick={() => fileUpload.current?.open()}
                    className={styles.action}
                  >
                    <DownloadIcon />
                    {t(`${I18N_PATH_TEXT}UploadNew`)}
                  </Typography>
                  <Typography color="alert" onClick={handleRemoveFile} className={styles.action}>
                    <DeleteIcon
                      role="button"
                      tabIndex={0}
                      aria-label={t('Text.Delete')}
                      onKeyDown={handleKeyDown}
                    />
                    {t('Text.Delete')}
                  </Typography>
                </>
              ) : null}
            </div>
            <FileUpload
              ref={fileUpload}
              onDropAccepted={handleFileInput}
              onDropRejected={handleFileError}
              acceptMimeTypes={attachmentMimeTypes}
              className={cx(styles.fileUpload, styles.logoInformation)}
              previewImage={preview}
              error={!!errors.logoUrl || !!errors.logo}
              placeholder={fileUploadPlaceholder}
            />
            {!!errors.logoUrl || !!errors.logo ? (
              <Typography color="alert" variant="bodySmall">
                {errors.logoUrl ?? errors.logo}
              </Typography>
            ) : null}
          </div>
          <div className={cx(sectionStyles.column, sectionStyles.fullWidth)}>
            <Typography
              fontWeight="bold"
              className={cx(sectionStyles.spaceBottom, sectionStyles.small)}
            >
              {t(`${I18N_PATH_TEXT}Preview`)}
            </Typography>
            <div className={styles.preview}>
              {preview ? (
                <img src={preview} className={styles.logo} alt="logo" />
              ) : (
                <LogoPlaceholder className={styles.logo} />
              )}
              <div className={styles.nameContainer}>
                <div className={styles.line1}>{values.nameLine1}</div>
                <div className={styles.line2}>{values.nameLine2}</div>
              </div>
            </div>
            <div className={sectionStyles.row}>
              <div className={sectionStyles.column}>
                <FormInput
                  name="nameLine1"
                  label={`${t(`${I18N_PATH_FORM}BusinessUnitNameLine`, { number: 1 })}*`}
                  value={values.nameLine1}
                  onChange={handleChange}
                  error={errors.nameLine1}
                />
              </div>
              <div className={sectionStyles.column}>
                <FormInput
                  name="nameLine2"
                  label={t(`${I18N_PATH_FORM}BusinessUnitNameLine`, { number: 2 })}
                  onChange={handleChange}
                  error={errors.nameLine2}
                  value={values.nameLine2 ?? undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(Section);
