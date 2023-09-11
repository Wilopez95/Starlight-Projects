import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { generateId } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { FormContainerLayout } from '../layout/FormContainer';

import { generateValidationSchema, getValues } from './formikData';
import { IProjectForm } from './types';

import formStyles from './css/styles.scss';

const I18N_PATH = 'components.forms.Project.Text.';

const ProjectForm: React.FC<IProjectForm> = ({
  locked,
  project,
  linkedData,
  onSubmit,
  onClose,
}) => {
  const { projectStore, customerStore } = useStores();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const generatedId = useRef(generateId());

  const selectedProject = projectStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;
  const isEditing = !!(selectedProject ?? project);

  const formik = useFormik({
    validationSchema: generateValidationSchema(projectStore, t, project),
    initialValues: getValues(
      generatedId.current,
      selectedProject ?? project,
      linkedData,
      selectedCustomer,
    ),
    validateOnChange: false,
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, setFieldValue, touched } = formik;
  const { dateFormat } = useDateIntl();

  return (
    <FormContainerLayout formik={formik}>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">
            {isEditing ? t(`${I18N_PATH}ConfigureProject`) : t(`${I18N_PATH}CreateNewProject`)}
          </Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1} justifyContent="space-around">
          <Layouts.Padding left="5" right="5">
            <Layouts.Margin top="3">
              <FormInput
                label={t(`${I18N_PATH}ProjectId`)}
                name="generatedId"
                value={values.generatedId}
                onChange={handleChange}
                readOnly
              />
            </Layouts.Margin>
            <Layouts.Flex alignItems="center">
              <Layouts.Padding bottom="3">
                <Typography
                  color="secondary"
                  variant="bodyMedium"
                  cursor="pointer"
                  as="label"
                  htmlFor="description"
                  className={formStyles.label}
                >
                  {t(`${I18N_PATH}Description`)}*
                </Typography>
              </Layouts.Padding>
              <span className={formStyles.textAreaWrapper}>
                <FormInput
                  name="description"
                  placeholder={t(`${I18N_PATH}AddProjectDescription`)}
                  value={values.description}
                  error={touched.description ? errors.description : undefined}
                  onChange={handleChange}
                  area
                />
              </span>
            </Layouts.Flex>
            <Layouts.Flex alignItems="center">
              <Layouts.Padding bottom="3">
                <Typography
                  color="secondary"
                  variant="bodyMedium"
                  cursor="pointer"
                  as="label"
                  htmlFor="startDate"
                  className={formStyles.label}
                >
                  {t(`${I18N_PATH}StartDate`)}
                </Typography>
              </Layouts.Padding>
              <Calendar
                name="startDate"
                withInput
                value={values?.startDate}
                placeholder={t('Text.SetDate')}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                onDateChange={setFieldValue}
                error={touched.startDate ? errors.startDate : undefined}
              />
            </Layouts.Flex>
            <Layouts.Flex alignItems="center">
              <Layouts.Padding bottom="3">
                <Typography
                  color="secondary"
                  variant="bodyMedium"
                  cursor="pointer"
                  as="label"
                  htmlFor="endDate"
                  className={formStyles.label}
                >
                  {t(`${I18N_PATH}EndDate`)}
                </Typography>
              </Layouts.Padding>
              <Calendar
                name="endDate"
                withInput
                value={values.endDate}
                placeholder={t('Text.SetDate')}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                onDateChange={setFieldValue}
                error={touched.endDate ? errors.endDate : undefined}
              />
            </Layouts.Flex>
            <Checkbox
              name="poRequired"
              value={values.poRequired}
              error={errors.poRequired}
              onChange={handleChange}
              labelClass={formStyles.checkbox}
              disabled={isEditing || locked?.poRequired}
            >
              {t(`${I18N_PATH}PONumberRequired`)}
            </Checkbox>
            <Checkbox
              name="permitRequired"
              value={values.permitRequired}
              error={errors.permitRequired}
              onChange={handleChange}
              labelClass={formStyles.checkbox}
              disabled={isEditing || locked?.permitRequired}
            >
              {t(`${I18N_PATH}PermitRequired`)}
            </Checkbox>
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset">Cancel</Button>
            <Button type="submit" variant={isEditing ? 'primary' : 'success'}>
              {isEditing ? t(`${I18N_PATH}SaveChanges`) : t(`${I18N_PATH}CreateNewProject`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default ProjectForm;
