import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Button, FileUpload, IFileUploadHandle, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { FormikHelpers, useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { CompanyService, LogoInformationRequest } from '@root/api';
import { DeleteIcon, DownloadIcon, LogoPlaceholder, PlusCircle } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FormContainer } from '@root/components';
import { convertDates, handleEnterOrSpaceKeyDown, NotificationHelper } from '@root/helpers';
import { usePermission, useUserContext } from '@root/hooks';

import { ActionCode } from '@root/helpers/notifications/types';
import { ApiError } from '@root/api/base/ApiError';
import { type ICompanySection } from '../types';

import sectionStyles from '../css/styles.scss';
import { getFormValues, validationSchema } from './formikData';

import styles from './css/styles.scss';

const attachmentMimeTypes = ['image/jpeg', 'image/png'];

const I18N_PATH_BASE = 'pages.SystemConfiguration.tables.Companies.sections.LogoInformation.';
const I18N_PATH = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_PATH_BASE}Form.`;
const I18N_PATH_VALIDATION_ERRORS = `${I18N_PATH_BASE}ValidationErrors.`;

const LogoInformationSection: React.FC<ICompanySection> = ({
  company,
  loading,
  onSetCompany,
  onSetCurrentCompany,
}) => {
  const fileUpload = useRef<IFileUploadHandle>(null);
  const [preview, setPreview] = useState<string>();
  const imageObjectUrl: MutableRefObject<string | null> = useRef<string>(null);
  const { setCompany } = useUserContext();
  const { t } = useTranslation();

  const canUpdateProfile = usePermission('configuration:company-profile:update');

  useEffect(
    () => () => {
      if (imageObjectUrl.current) {
        URL.revokeObjectURL(imageObjectUrl.current);
      }
    },
    [],
  );

  const onSubmit = useCallback(
    async (
      logoInformation: LogoInformationRequest,
      helpers: FormikHelpers<LogoInformationRequest>,
    ) => {
      try {
        if (!logoInformation.logoUrl && logoInformation.logo === null) {
          logoInformation.logoUrl = null;
        }

        if (logoInformation.logo && logoInformation.logo instanceof File) {
          logoInformation.logoUrl = undefined;
        }
        const response = convertDates(await CompanyService.updateLogoInformation(logoInformation));
        const { companyNameLine1, companyNameLine2, logoUrl, updatedAt } = response;

        setCompany({
          companyNameLine1,
          companyNameLine2,
          logoUrl,
        });
        if (company) {
          onSetCompany?.({ ...company, updatedAt });
        }
        helpers.setFieldValue('updatedAt', updatedAt);
        NotificationHelper.success('update', 'Company logo information');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error(
          'update',
          typedError.response.code as ActionCode,
          'Company logo information',
        );
        if (typedError.statusCode === 412) {
          onSetCurrentCompany?.();
        }
      }
    },
    [company, setCompany, onSetCompany, onSetCurrentCompany],
  );

  const formik = useFormik({
    enableReinitialize: loading,
    initialValues: getFormValues(company) as LogoInformationRequest,
    validationSchema: validationSchema(t, I18N_PATH_VALIDATION_ERRORS),
    onSubmit,
    validateOnChange: false,
  });

  const { values, errors, setFieldValue, setFormikState, setFieldError, handleChange } = formik;

  useEffect(() => {
    setPreview(
      values.logoUrl ? `${values.logoUrl}?${new Date().getTime()}` : values.logo?.imagePreview,
    );
  }, [values.logoUrl, values.logo?.imagePreview, values.updatedAt]);

  useLayoutEffect(() => {
    setFieldValue('updatedAt', company?.updatedAt);
  }, [company, setFieldValue]);

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
          logoUrl: null,
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
        setFieldError('logo', t(`${I18N_PATH_VALIDATION_ERRORS}FileTooLarge`));
      } else if (
        rejections.some(rejection =>
          rejection.errors.some(error => error.code === 'file-invalid-type'),
        )
      ) {
        setFieldError(
          'logo',
          t(`${I18N_PATH}PleaseOnlyUpload`, {
            extensions: '.jpg, .png',
          }),
        );
      }
    },
    [t, setFieldError],
  );

  const handleRemoveFile = useCallback(
    event => {
      if (event.type === 'keyup' && event.nativeEvent.code !== 'Enter') {
        return;
      }

      setFieldValue('logoUrl', null);
      setFieldValue('logo', null);
    },
    [setFieldValue],
  );
  const handleUploadFile = useCallback(event => {
    if (event.type === 'keyup' && event.nativeEvent.code !== 'Enter') {
      return;
    }
    fileUpload.current?.open();
  }, []);

  const fileUploadPlaceholder = !preview && (
    <Layouts.Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={styles.uploadPlaceholder}
    >
      <Layouts.Margin bottom="3">
        <PlusCircle className={styles.icon} />
      </Layouts.Margin>
      {canUpdateProfile ? (
        <Button onClick={preview ? fileUpload.current?.open : undefined}>
          {t('Text.UploadLogo')}
        </Button>
      ) : null}
    </Layouts.Flex>
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleRemoveFile(e);
      }
    },
    [handleRemoveFile],
  );

  return (
    <FormContainer formik={formik}>
      <div className={sectionStyles.section}>
        <Layouts.Padding padding="3">
          <Layouts.Flex>
            <Layouts.Margin right="5">
              <Layouts.Flex direction="column">
                <Layouts.Margin bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    {preview && canUpdateProfile ? (
                      <>
                        <Typography
                          tabIndex={0}
                          color="information"
                          variant="bodyMedium"
                          cursor="pointer"
                          role="button"
                          onClick={() => fileUpload.current?.open()}
                          onKeyUp={handleUploadFile}
                        >
                          <Layouts.Flex alignItems="center">
                            <Layouts.Margin right="1">
                              <DownloadIcon />
                            </Layouts.Margin>
                            {t(`${I18N_PATH}UploadNew`)}
                          </Layouts.Flex>
                        </Typography>
                        <Typography
                          tabIndex={0}
                          color="alert"
                          variant="bodyMedium"
                          cursor="pointer"
                          role="button"
                          onClick={handleRemoveFile}
                          onKeyUp={handleRemoveFile}
                        >
                          <Layouts.Flex alignItems="center">
                            <Layouts.Margin right="1">
                              <DeleteIcon
                                tabIndex={0}
                                aria-label={t('Text.Delete')}
                                onKeyDown={handleKeyDown}
                              />
                            </Layouts.Margin>
                            {t(`Text.Delete`)}
                          </Layouts.Flex>
                        </Typography>
                      </>
                    ) : null}
                  </Layouts.Flex>
                </Layouts.Margin>
                <FileUpload
                  ref={fileUpload}
                  onDropAccepted={handleFileInput}
                  onDropRejected={handleFileError}
                  acceptMimeTypes={attachmentMimeTypes}
                  className={cx(styles.fileUpload, styles.logoInfo)}
                  previewImage={preview}
                  error={!!errors.logoUrl || !!errors.logo}
                  placeholder={fileUploadPlaceholder}
                />
                {!!errors.logoUrl || !!errors.logo ? (
                  <Typography color="alert" variant="bodySmall">
                    {errors.logoUrl ?? errors.logo}
                  </Typography>
                ) : null}
              </Layouts.Flex>
            </Layouts.Margin>
            <Layouts.Flex direction="column" className={styles.fullWidth}>
              <Layouts.Margin bottom="2">
                <Typography variant="headerFive">{t(`${I18N_PATH}Preview`)}</Typography>
              </Layouts.Margin>
              <Layouts.Margin bottom="3">
                <Layouts.Box backgroundColor="secondary">
                  <Layouts.Padding padding="5">
                    <Layouts.Flex alignItems="center">
                      <Layouts.Margin right="3">
                        {preview ? (
                          <img src={preview} className={styles.logo} alt="logo" />
                        ) : (
                          <LogoPlaceholder className={styles.logo} />
                        )}
                      </Layouts.Margin>
                      <Layouts.Flex direction="column">
                        <Typography color="secondary" shade="desaturated" variant="headerTwo">
                          {values.companyNameLine1}
                        </Typography>
                        <Typography color="secondary" shade="desaturated" variant="headerFour">
                          {values.companyNameLine2}
                        </Typography>
                      </Layouts.Flex>
                    </Layouts.Flex>
                  </Layouts.Padding>
                </Layouts.Box>
              </Layouts.Margin>
              <Layouts.Column single>
                <Layouts.Flex>
                  <Layouts.Column>
                    <FormInput
                      name="companyNameLine1"
                      label={`${t(`${I18N_PATH_FORM}CompanyNameLine`, { number: 1 })}*`}
                      value={values.companyNameLine1}
                      onChange={handleChange}
                      error={errors.companyNameLine1}
                    />
                  </Layouts.Column>
                  <Layouts.Column>
                    <FormInput
                      name="companyNameLine2"
                      label={t(`${I18N_PATH_FORM}CompanyNameLine`, { number: 2 })}
                      value={values.companyNameLine2}
                      onChange={handleChange}
                      error={errors.companyNameLine2}
                    />
                  </Layouts.Column>
                </Layouts.Flex>
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Flex>
        </Layouts.Padding>
        <Divider />
        <Layouts.Flex justifyContent="flex-end">
          <Layouts.Padding padding="3">
            {canUpdateProfile ? (
              <Button type="submit" variant="primary">
                {t(`${I18N_PATH}SaveLogo`)}
              </Button>
            ) : null}
          </Layouts.Padding>
        </Layouts.Flex>
      </div>
    </FormContainer>
  );
};

export default observer(LogoInformationSection);
