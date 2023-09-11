import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Calendar,
  Checkbox,
  IFileUploadHandle,
  ISelectOption,
  Layouts,
  MultiSelect,
  Select,
} from '@starlightpro/shared-components';
import { addDays, differenceInDays } from 'date-fns';
import { useFormikContext } from 'formik';
import { capitalize } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon, DownloadIcon } from '@root/assets';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { PhoneField } from '@root/components';
import { handleEnterOrSpaceKeyDown, imageOnlyMimeTypes } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { IDriverFormikData } from '@root/types';

import * as Styles from './styles';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.Driver.');

const DriverQuickViewRightPanel: React.FC = () => {
  const { values, errors, handleChange, setFieldValue, setFieldError } =
    useFormikContext<IDriverFormikData>();
  const { t } = useTranslation();
  const { driverStore, systemConfigurationStore, truckStore, businessUnitStore } = useStores();
  const { dateFormat, formatDate } = useDateIntl();
  const { weekDays, firstDayOfWeek } = useIntl();

  const selectedDriver = driverStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedDriver || isCreating;

  const title = isNew ? t(`${I18N_PATH.Text}NewDriver`) : selectedDriver?.description;

  const fileUpload = useRef<IFileUploadHandle>(null);
  const imageObjectUrl: MutableRefObject<string | null> = useRef<string>(null);

  const businessUnitOptions: ISelectOption[] = useMemo(
    () =>
      businessUnitStore.values.map(elem => ({
        value: elem.id,
        label: elem.nameLine1,
      })),
    [businessUnitStore.values],
  );
  const truckOptions: ISelectOption[] = useMemo(
    () =>
      truckStore.values.map(elem => ({
        value: elem.id,
        label: elem.description,
      })),
    [truckStore.values],
  );

  const handleBUChange = useCallback(
    (key, businessUnitIds) => {
      truckStore.cleanup();
      setFieldValue(key as string, businessUnitIds);
      if (businessUnitIds.length > 0) {
        truckStore.requestAll({ activeOnly: true, filterByBusinessUnit: businessUnitIds });
      } else {
        setFieldValue('truckId', undefined);
      }
    },
    [setFieldValue, truckStore],
  );

  useEffect(() => {
    if (truckOptions.length > 0 && !truckOptions.some(elem => elem.value === values.truckId)) {
      setFieldValue('truckId', undefined);
    }
  }, [values.truckId, truckOptions, isNew, setFieldValue]);

  const handleRemoveFile = useCallback(() => {
    setFieldValue('photoUrl', null);
    setFieldValue('image', null);
  }, [setFieldValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };
  const handleFileInput = useCallback(
    ([image]: File[]) => {
      if (imageObjectUrl.current) {
        URL.revokeObjectURL(imageObjectUrl.current);
      }

      const imagePreview = URL.createObjectURL(image);

      imageObjectUrl.current = imagePreview;
      Object.assign(image, { imagePreview });

      setFieldValue('image', image);
      setFieldValue('photoUrl', null);
      setFieldError('image', undefined);
      setFieldError('photoUrl', undefined);
    },
    [setFieldValue, setFieldError],
  );

  const handleWorkingDaysChange = useCallback(
    (dayId: number, oldValue) => {
      const days = [...values.workingWeekdays];

      if (oldValue) {
        // unselect day
        const oldIndex = days.indexOf(dayId);

        if (oldIndex > -1) {
          days.splice(oldIndex, 1);
        }
      } else {
        // select day
        days.push(dayId);
      }
      setFieldValue('workingWeekdays', days);
    },
    [setFieldValue, values.workingWeekdays],
  );

  const handleFileError = useCallback(
    (rejections: FileRejection[]) => {
      if (
        rejections.some(rejection =>
          rejection.errors.some(error => error.code === 'file-too-large'),
        )
      ) {
        setFieldError('photoUrl', t(`${I18N_PATH.ValidationErrors}FileTooLarge`));
      } else {
        setFieldError('photoUrl', t(`${I18N_PATH.ValidationErrors}PleaseOnlyUpload`));
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

  return (
    <>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{title}</Typography>
        <Typography variant="caption" textTransform="uppercase">
          {t(`${I18N_PATH.Text}Driver`)}
        </Typography>
        <Divider top />
      </Layouts.Padding>
      <Layouts.Scroll>
        <Layouts.Padding padding="3">
          <Layouts.Margin bottom="2">
            <Layouts.Flex>
              <Layouts.Column>
                <Typography color="secondary" shade="desaturated">
                  {t('Text.Status')}
                </Typography>
              </Layouts.Column>
              <Layouts.Column>
                <Layouts.Margin right="3.5">
                  <Checkbox
                    id="activeCheckbox"
                    name="active"
                    value={values.active}
                    onChange={handleChange}
                  >
                    {t('Text.Active')}
                  </Checkbox>
                </Layouts.Margin>
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Margin>

          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Margin top="1">
                <Typography color="secondary" shade="desaturated">
                  {t(`${I18N_PATH.Text}DriverPhoto`)}
                </Typography>
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Column>
              <Styles.StyledFileUpload
                ref={fileUpload}
                onDropAccepted={handleFileInput}
                onDropRejected={handleFileError}
                acceptMimeTypes={imageOnlyMimeTypes}
                previewImage={values.photoUrl ?? values.image?.imagePreview}
                error={!!errors.image || !!errors.photoUrl}
              />
              {!!errors.image || !!errors.photoUrl ? (
                <Typography color="alert" variant="bodySmall">
                  {errors.image ?? errors.photoUrl}
                </Typography>
              ) : null}
              <Layouts.Margin top="1" bottom="2">
                <Layouts.Flex>
                  <Button variant="none" onClick={() => fileUpload.current?.open()}>
                    <Layouts.Flex alignItems="center">
                      <DownloadIcon />
                      <Typography color="information">{t('Text.UploadNew')}</Typography>
                    </Layouts.Flex>
                  </Button>
                  {values.image || values.photoUrl ? (
                    <Button variant="none" onClick={handleRemoveFile}>
                      <Layouts.Flex alignItems="center">
                        <DeleteIcon
                          role="button"
                          tabIndex={0}
                          aria-label={t('Text.Delete')}
                          onKeyDown={e => handleKeyDown(e, handleRemoveFile)}
                        />
                        <Typography color="alert">{t('Text.Delete')}</Typography>
                      </Layouts.Flex>
                    </Button>
                  ) : null}
                </Layouts.Flex>
              </Layouts.Margin>
            </Layouts.Column>
          </Layouts.Flex>
          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Margin top="1">
                <Typography color="secondary" as="label" htmlFor="description" shade="desaturated">
                  {t(`${I18N_PATH.Text}FullName`)}*
                </Typography>
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Column>
              <FormInput
                name="description"
                onChange={handleChange}
                value={values.description}
                error={errors.description}
              />
            </Layouts.Column>
          </Layouts.Flex>
          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Margin top="1">
                <Typography color="secondary" as="label" htmlFor="email" shade="desaturated">
                  {t(`Text.Email`)}*
                </Typography>
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Column>
              <FormInput
                name="email"
                onChange={handleChange}
                value={values.email}
                error={errors.email}
              />
            </Layouts.Column>
          </Layouts.Flex>
          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Margin top="1">
                <Typography color="secondary" as="label" htmlFor="phone" shade="desaturated">
                  {t(`Text.Phone`)} #
                </Typography>
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Column>
              <PhoneField
                name="phone"
                onChange={handleChange}
                value={values.phone}
                error={errors.phone}
              />
            </Layouts.Column>
          </Layouts.Flex>
          <Divider />
          <Layouts.Margin top="2">
            <Layouts.Flex>
              <Layouts.Column>
                <Layouts.Margin top="1">
                  <Typography
                    color="secondary"
                    as="label"
                    htmlFor="licenseNumber"
                    shade="desaturated"
                  >
                    {t(`${I18N_PATH.Text}LicenseNumber`)}*
                  </Typography>
                </Layouts.Margin>
              </Layouts.Column>
              <Layouts.Column>
                <FormInput
                  name="licenseNumber"
                  onChange={handleChange}
                  value={values.licenseNumber}
                  error={errors.licenseNumber}
                />
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Margin>
          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Margin top="1">
                <Typography color="secondary" as="label" htmlFor="licenseType" shade="desaturated">
                  {t(`${I18N_PATH.Text}LicenseType`)}*
                </Typography>
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Column>
              <FormInput
                name="licenseType"
                onChange={handleChange}
                value={values.licenseType}
                error={errors.licenseType}
              />
            </Layouts.Column>
          </Layouts.Flex>
          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Margin top="1">
                <Typography
                  color="secondary"
                  as="label"
                  htmlFor="licenseValidityDate"
                  shade="desaturated"
                >
                  {t(`${I18N_PATH.Text}LicenseValidity`)}*
                </Typography>
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Margin left="2">
              <Layouts.Box width="168px">
                <Calendar
                  name="licenseValidityDate"
                  withInput
                  value={values.licenseValidityDate}
                  placeholder={t('Text.SetDate')}
                  firstDayOfWeek={firstDayOfWeek}
                  dateFormat={dateFormat}
                  formatDate={formatDate}
                  onDateChange={setFieldValue}
                  error={errors.licenseValidityDate}
                  minDate={addDays(new Date(), 1)}
                />
                {values.licenseValidityDate &&
                differenceInDays(values.licenseValidityDate, new Date()) < 30 ? (
                  <Layouts.Margin bottom="2">
                    <Styles.StyledBadge borderRadius={4} bgShade="desaturated">
                      <Typography color="primary">{t(`${I18N_PATH.Text}DriverLicense`)}</Typography>
                    </Styles.StyledBadge>
                  </Layouts.Margin>
                ) : null}
              </Layouts.Box>
            </Layouts.Margin>
          </Layouts.Flex>
          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Margin top="1">
                <Typography
                  color="secondary"
                  as="label"
                  htmlFor="licenseValidityDate"
                  shade="desaturated"
                >
                  {t(`${I18N_PATH.Text}MedCardValidity`)}
                </Typography>
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Margin left="2">
              <Layouts.Box width="168px">
                <Calendar
                  name="medicalCardValidityDate"
                  withInput
                  value={values.medicalCardValidityDate}
                  placeholder={t('Text.SetDate')}
                  firstDayOfWeek={firstDayOfWeek}
                  dateFormat={dateFormat}
                  formatDate={formatDate}
                  onDateChange={setFieldValue}
                  error={errors.medicalCardValidityDate}
                  minDate={addDays(new Date(), 1)}
                />
                {values.medicalCardValidityDate &&
                differenceInDays(values.medicalCardValidityDate, new Date()) < 30 ? (
                  <Layouts.Margin bottom="2">
                    <Styles.StyledBadge borderRadius={4} bgShade="desaturated">
                      <Typography color="primary">
                        {t(`${I18N_PATH.Text}MedicalLicense`)}
                      </Typography>
                    </Styles.StyledBadge>
                  </Layouts.Margin>
                ) : null}
              </Layouts.Box>
            </Layouts.Margin>
          </Layouts.Flex>
          <Divider />
          <Layouts.Margin top="2">
            <Layouts.Flex>
              <MultiSelect
                name="businessUnitIds"
                label="Business Units*"
                onSelectChange={handleBUChange}
                options={businessUnitOptions}
                value={values.businessUnitIds}
                error={errors.businessUnitIds}
              />
            </Layouts.Flex>
            <Layouts.Flex>
              <Layouts.Column>
                <Layouts.Margin top="1">
                  <Typography color="secondary" shade="desaturated">
                    {t(`${I18N_PATH.Text}DefaultTruck`)}*
                  </Typography>
                </Layouts.Margin>
              </Layouts.Column>
              <Layouts.Column>
                <Select
                  name="truckId"
                  options={truckOptions}
                  ariaLabel={t(`${I18N_PATH.Text}TruckId`)}
                  value={values.truckId}
                  error={errors.truckId}
                  onSelectChange={setFieldValue}
                  nonClearable
                />
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Margin>
          <Divider />
          <Layouts.Margin top="2">
            <Layouts.Flex>
              <Layouts.Column>
                <Layouts.Margin top="1">
                  <Typography id="working-days-label" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH.Text}WorkingDays`)}
                  </Typography>
                </Layouts.Margin>
              </Layouts.Column>
              <Layouts.Column>
                <Layouts.Padding bottom="3">
                  <Layouts.Grid
                    columns="2fr 1fr"
                    as="ul"
                    role="group"
                    aria-labelledby="working-days-label"
                  >
                    {Object.entries(weekDays).map(([day, index]) => {
                      const value = values.workingWeekdays.includes(index);

                      return (
                        <Layouts.Cell key={day} role="listitem">
                          <Layouts.Margin bottom="1">
                            <Checkbox
                              id={day}
                              key={day}
                              name={`workingWeekdays.${day}`}
                              value={value}
                              onChange={() => handleWorkingDaysChange(index, value)}
                            >
                              <Typography aria-label={day} color="secondary" shade="desaturated">
                                {capitalize(day.slice(0, 2))}
                              </Typography>
                            </Checkbox>
                          </Layouts.Margin>
                        </Layouts.Cell>
                      );
                    })}
                  </Layouts.Grid>
                </Layouts.Padding>
              </Layouts.Column>
            </Layouts.Flex>
          </Layouts.Margin>
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};

export default observer(DriverQuickViewRightPanel);
