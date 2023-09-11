import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api';
import {
  FormInput,
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common';
import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { convertDates, generateId } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useIsRecyclingFacilityBU, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { ICustomerJobSitePair } from '@root/types';

import { generateValidationSchema, getValues } from './formikData';

import styles from './css/styles.scss';

const ProjectQuickViewContent: React.FC = () => {
  const { projectStore, customerStore, jobSiteStore } = useStores();
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();

  const generatedId = useRef<string>();
  const [linkedData, setLinkedData] = useState<ICustomerJobSitePair | undefined>();

  const customer = customerStore.selectedEntity;
  const jobSite = jobSiteStore.selectedEntity;
  const project = projectStore.selectedEntity;

  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const { values, errors, handleChange, setFieldValue, validateForm, isValidating, dirty } =
    useFormik({
      validationSchema: generateValidationSchema(projectStore),
      initialValues: getValues(generatedId.current, project),
      validateOnChange: false,
      enableReinitialize: true,
      initialErrors: {},
      onSubmit: noop,
    });

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    if (!generatedId.current) {
      generatedId.current = generateId();
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (jobSite && customer) {
        try {
          const linkedDataDates = convertDates(
            await GlobalService.getJobSiteCustomerPair(jobSite.id, customer.id),
          );

          setLinkedData(linkedDataDates);

          if (!values.id) {
            setFieldValue('poRequired', linkedDataDates?.poRequired ?? true);
            setFieldValue('permitRequired', linkedDataDates?.permitRequired ?? false);
          }
        } catch {
          if (!values.id) {
            setFieldValue('poRequired', true);
            setFieldValue('permitRequired', false);
          }
        }
      }
    })();
  }, [customer, jobSite, setFieldValue, values.id]);

  const handleProjectSave = useCallback(async () => {
    const formErrors = await validateForm();

    if (!isEmpty(formErrors)) {
      return;
    }

    const customerJobSiteId = linkedData?.id;

    if (values.id === 0) {
      if (customerJobSiteId) {
        await projectStore.create({
          ...values,
          customerJobSiteId,
        });
      }
    } else {
      await projectStore.update(values);
    }

    if (!projectStore.isPreconditionFailed) {
      forceCloseQuickView();
      projectStore.unSelectEntity();
    }
  }, [linkedData, projectStore, validateForm, values, forceCloseQuickView]);

  const { dateFormat } = useDateIntl();

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  return (
    <QuickViewContent
      dirty={dirty}
      confirmModal={<QuickViewConfirmModal />}
      rightPanelElement={
        <>
          <Layouts.Padding padding="3">
            <div className={tableQuickViewStyles.quickViewTitle}>
              {project ? project.description : 'Create new project'}
            </div>
          </Layouts.Padding>
          <Divider />

          <Layouts.Scroll>
            <Layouts.Padding padding="3">
              <div className={styles.container}>
                <div className={styles.projectIDWrapper}>
                  <FormInput
                    label="Project ID (auto-generated)"
                    name="generatedId"
                    value={values.generatedId}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <Layouts.Flex alignItems="center">
                  <label htmlFor="description" className={styles.label}>
                    Description*
                  </label>
                  <span className={styles.textAreaWrapper}>
                    <FormInput
                      name="description"
                      placeholder="Add project description"
                      value={values.description}
                      error={errors.description}
                      onChange={handleChange}
                      area
                    />
                  </span>
                </Layouts.Flex>
                <Layouts.Flex alignItems="center">
                  <label htmlFor="startDate" className={styles.label}>
                    Start Date
                  </label>
                  <Calendar
                    name="startDate"
                    withInput
                    value={values?.startDate}
                    placeholder={t('Text.SetDate')}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    onDateChange={setFieldValue}
                    error={errors.startDate}
                  />
                </Layouts.Flex>
                <Layouts.Flex alignItems="center">
                  <label htmlFor="endDate" className={styles.label}>
                    End Date
                  </label>
                  <Calendar
                    name="endDate"
                    withInput
                    value={values.endDate}
                    placeholder={t('Text.SetDate')}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    onDateChange={setFieldValue}
                    error={errors.endDate}
                  />
                </Layouts.Flex>
                <Checkbox
                  name="poRequired"
                  value={values.poRequired}
                  error={errors.poRequired}
                  onChange={handleChange}
                  labelClass={styles.checkbox}
                  disabled={!!linkedData?.poRequired || !!customer?.poRequired}
                >
                  PO number required
                </Checkbox>
                {!isRecyclingFacilityBU ? (
                  <Checkbox
                    name="permitRequired"
                    value={values.permitRequired}
                    error={errors.permitRequired}
                    onChange={handleChange}
                    labelClass={styles.checkbox}
                    disabled={!!linkedData?.permitRequired}
                  >
                    Permit required
                  </Checkbox>
                ) : null}
              </div>
            </Layouts.Padding>
          </Layouts.Scroll>
        </>
      }
      actionsElement={
        <ButtonContainer
          onCancel={closeQuickView}
          submitButtonType="button"
          isCreating={!project}
          onSave={handleProjectSave}
        />
      }
    />
  );
};

export default observer(ProjectQuickViewContent);
