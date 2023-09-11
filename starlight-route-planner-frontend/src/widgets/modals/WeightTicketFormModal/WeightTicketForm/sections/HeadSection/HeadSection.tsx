import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  acceptableMimeTypes,
  CrossIcon,
  DownloadIcon,
  FormInput,
  IFileUploadHandle,
  ISelectOption,
  Layouts,
  NonServiceOrderIcon as FileIcon,
  Select,
  Typography,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { NotificationHelper } from '@root/helpers';
import { useStores } from '@root/hooks';
import { useMedia } from '@root/hooks/useMedia';
import { ConfirmModal } from '@root/widgets/modals/Confirm/Confirm';

import { IWeightTicketFormValues, IWeightTicketSection } from '../../types';

import {
  CrossIconCircle,
  FacilityNameWrapper,
  FileUpload,
  MediaInfoWrapper,
  UploadedFileInfoWrapper,
} from './styles';

const I18N_PATH_BASE = 'components.modals.WeightTicket.';
const I18N_PATH = `${I18N_PATH_BASE}Text.`;
const I18N_VALIDATION_PATH = `${I18N_PATH_BASE}Validation.`;
const I18N_PATH_ROOT = `Text.`;
const I18N_PATH_MEDIA = 'quickViews.WorkOrderEdit.Text.';
const mimeTypes = [...acceptableMimeTypes, 'image/jfif'];

export const HeadSection: React.FC<IWeightTicketSection> = observer(({ styleProps, isEdit }) => {
  const { errors, values, setFieldValue, handleChange, setFieldError } =
    useFormikContext<IWeightTicketFormValues>();
  const { t } = useTranslation();
  const fileUpload = useRef<IFileUploadHandle>(null);
  const { waypointsStore } = useStores();

  const facilityOptions: ISelectOption[] = useMemo(
    () =>
      waypointsStore.values.map(({ description, id }) => ({
        label: description,
        value: id,
      })),
    [waypointsStore.values],
  );

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (files.length > 1) {
        NotificationHelper.error(t(`${I18N_VALIDATION_PATH}ErrorManyFiles`));

        return;
      }

      setFieldValue('media', [files[0]]);
    },
    [setFieldValue, t],
  );

  const {
    filesPreviewMediaData,
    isConfirmDeleteOpen,
    handleFileRejection,
    handleConfirmDeleteCancel,
    handleRemoveMedia,
    handleConfirmDeleteSubmit,
  } = useMedia();

  const handleRemoveSingleMediaFile = useCallback(() => {
    handleRemoveMedia(0);
  }, [handleRemoveMedia]);

  const mediaFile = filesPreviewMediaData[0] || {};

  const handleClearError = useCallback(() => {
    setFieldError('media', undefined);
  }, [setFieldError]);

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        cancelButton={t(`${I18N_PATH_ROOT}Cancel`)}
        submitButton={t(`${I18N_PATH_MEDIA}DeleteMediaFile`)}
        title={t(`${I18N_PATH_MEDIA}DeleteMediaFile`)}
        subTitle={t(`${I18N_PATH_MEDIA}AreYouSure`)}
        onCancel={handleConfirmDeleteCancel}
        onSubmit={handleConfirmDeleteSubmit}
        className="confirm-remove-media"
      />
      <Layouts.Flex alignItems="flex-start" direction="column">
        <Layouts.Padding bottom="2">
          <Typography variant="headerThree">
            {isEdit ? t(`${I18N_PATH}EditTicket`) : t(`${I18N_PATH}AddTicket`)}
          </Typography>
        </Layouts.Padding>
        <Layouts.Flex alignItems="center">
          <Layouts.Padding right="2">
            <Layouts.Box width={styleProps.columnWidth}>
              <FormInput
                name="ticketNumber"
                value={values.ticketNumber || undefined}
                error={errors.ticketNumber}
                onChange={handleChange}
                label={t(`${I18N_PATH}TicketNumber`)}
                placeholder={t(`${I18N_PATH_ROOT}Number`)}
              />
            </Layouts.Box>
          </Layouts.Padding>
          <MediaInfoWrapper justifyContent="center" alignItems="center" onClick={handleClearError}>
            {mediaFile.fileName ? (
              <>
                <Layouts.Margin left="0.5" right="1">
                  <FileIcon />
                </Layouts.Margin>
                <UploadedFileInfoWrapper>
                  <Typography as="span" color="information" textAlign="left" variant="bodyMedium">
                    {mediaFile.fileName}
                  </Typography>
                  <Typography
                    as="span"
                    color="secondary"
                    shade="desaturated"
                    textAlign="left"
                    variant="bodyMedium"
                  >
                    {' '}
                    {t(`${I18N_PATH}UploadedMediaFile`)}
                  </Typography>

                  <CrossIconCircle onClick={handleRemoveSingleMediaFile}>
                    <CrossIcon tabIndex={0} aria-label={t('Text.Delete')} />
                  </CrossIconCircle>
                </UploadedFileInfoWrapper>

                <Layouts.Margin left="1" />
              </>
            ) : (
              <>
                <Layouts.Margin left="0.5" right="1">
                  <DownloadIcon />
                </Layouts.Margin>
                <Typography color="information" textAlign="left" variant="bodyMedium">
                  {t(`${I18N_PATH}UploadMediaFile`)}
                  {errors.media && (
                    <Typography color="alert" variant="bodySmall">
                      {errors.media}
                    </Typography>
                  )}
                </Typography>
                <FileUpload
                  ref={fileUpload}
                  onDropAccepted={handleFileUpload}
                  onDropRejected={handleFileRejection}
                  acceptMimeTypes={mimeTypes}
                />
              </>
            )}
          </MediaInfoWrapper>
        </Layouts.Flex>
        <Layouts.Grid columns={styleProps.columnsTemplate} gap={styleProps.gap}>
          <FacilityNameWrapper>
            <Select
              placeholder={t('Text.Select')}
              name="disposalSiteId"
              onSelectChange={setFieldValue}
              value={values.disposalSiteId}
              label="Facility Name"
              options={facilityOptions}
              error={errors.disposalSiteId}
              nonClearable
            />
          </FacilityNameWrapper>
          <Layouts.Column />
          <Layouts.Column />
        </Layouts.Grid>
      </Layouts.Flex>
    </>
  );
});
