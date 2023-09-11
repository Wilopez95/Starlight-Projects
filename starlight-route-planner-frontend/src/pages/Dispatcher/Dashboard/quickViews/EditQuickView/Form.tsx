import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, Layouts } from '@starlightpro/shared-components';
import { addMinutes, format } from 'date-fns';
import { useFormik } from 'formik';
import { isArray } from 'lodash-es';

import { Divider } from '@root/common/TableTools';
import { DateFormat } from '@root/consts';
import { useStores } from '@root/hooks';
import { QuickViewHeaderTitle } from '@root/quickViews';
import { IUpdateDashboardDailyRouteParams } from '@root/stores/dashboard/types';

import { FormBase } from './FormBase';
import { FormDataType, getInitialValues, validationSchema } from './formikData';
import { IForm } from './types';

const I18N_PATH_DR_EDIT = 'quickViews.DashboardDailyRouteEdit.Text.';
const I18N_PATH_VALIDATION = 'quickViews.DailyRouteForm.DetailsTab.Validation.';
const I18N_PATH_ROOT = 'Text.';

const getNormalizedData = (values: FormDataType) => {
  const { clockIn, clockOut, weightTickets: _, ...restValues } = values;
  const normalizedData: Partial<IUpdateDashboardDailyRouteParams> = {};

  if (clockIn) {
    normalizedData.clockIn = format(
      addMinutes(clockIn, clockIn.getTimezoneOffset()),
      DateFormat.Time,
    );
  }

  if (clockOut) {
    normalizedData.clockOut = format(
      addMinutes(clockOut, clockOut.getTimezoneOffset()),
      DateFormat.Time,
    );
  }

  return {
    ...restValues,
    ...normalizedData,
  } as IUpdateDashboardDailyRouteParams;
};

export const Form: React.FC<IForm> = ({ scrollContainerHeight, dailyRoute, onAddRef, onClose }) => {
  const { t } = useTranslation();
  const { dashboardStore } = useStores();

  const onFormSubmit = useCallback(
    async (values: FormDataType) => {
      const normalizedData = getNormalizedData(values);

      const result = await dashboardStore.updateDashboardDailyRoute(dailyRoute.id, normalizedData);

      if (result) {
        if (isArray(result)) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          setFieldValue('weightTicketConflicts', result);
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        setFieldError('name', t(`${I18N_PATH_VALIDATION}RouteNameLengthAndUniqueness`));

        return;
      }

      onClose();
    },

    [dashboardStore, dailyRoute, onClose],
  );

  const formik = useFormik({
    initialValues: getInitialValues(dailyRoute, dashboardStore.quickViewSettings.status),
    onSubmit: onFormSubmit,
    enableReinitialize: true,
    validationSchema: validationSchema(t),
  });

  const { resetForm, handleSubmit, setFieldError, setFieldValue } = formik;

  const onCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Layouts.Box position="relative" ref={onAddRef}>
        <Layouts.Padding left="3" right="3">
          <QuickViewHeaderTitle name={dailyRoute.id} businessLineType={dailyRoute.businessLineType}>
            {t(`${I18N_PATH_DR_EDIT}Title`)}
            {dailyRoute.id}
          </QuickViewHeaderTitle>
          <Layouts.Margin top="2">
            <Divider />
          </Layouts.Margin>
        </Layouts.Padding>
      </Layouts.Box>
      <Layouts.Scroll height={scrollContainerHeight}>
        <FormContainer formik={formik}>
          <Layouts.Padding left="3" right="3" bottom="3" top="2">
            <FormBase dailyRoute={dailyRoute} />
          </Layouts.Padding>
        </FormContainer>
      </Layouts.Scroll>
      <Layouts.Box position="relative" ref={onAddRef}>
        <Divider />
        <Layouts.Padding top="2" bottom="2" left="3" right="3">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={onCancel}>
              {t(`${I18N_PATH_ROOT}Cancel`)}
            </Button>
            <Button variant="primary" type="submit" onClick={() => handleSubmit()}>
              {t(`${I18N_PATH_ROOT}SaveChanges`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};
