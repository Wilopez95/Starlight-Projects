import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, Layouts, Typography } from '@starlightpro/shared-components';

import { useFormik } from 'formik';

import { Divider } from '@root/common/TableTools';
import { CalendarAdapter as Calendar } from '@root/widgets/CalendarAdapter/Calendar';

import { addDays } from 'date-fns';
import { defaultValues } from './formikData';
import { IPublishRouteForm } from './types';

const I18N_PATH = 'components.modals.PublishRoute.';
const I18N_ROOT_PATH = 'Text.';

export const PublishRouteForm: React.FC<Omit<IPublishRouteForm, 'isOpen'>> = ({
  onClose,
  onPublish,
}) => {
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: defaultValues,
    onSubmit: onPublish,
  });

  const { values, setFieldValue, submitForm } = formik;

  return (
    <FormContainer formik={formik}>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">{t(`${I18N_PATH}Title`)}</Typography>
        </Layouts.Padding>
        <Layouts.Padding left="5" right="5" bottom="2" top="3">
          <Layouts.Flex justifyContent="space-between" alignItems="baseline">
            <Layouts.Flex flexGrow={1}>
              <Typography variant="bodyMedium">{t(`${I18N_PATH}SelectDate`)}</Typography>
            </Layouts.Flex>
            <Layouts.Flex flexGrow={1}>
              <Calendar
                name="publishDate"
                withInput
                value={values.publishDate}
                minDate={addDays(new Date(), 1)}
                onDateChange={setFieldValue}
                noError
              />
            </Layouts.Flex>
          </Layouts.Flex>
          <Typography variant="headerFive">
            {t(`${I18N_PATH}Note`)}
            <Typography as="span" variant="bodyMedium">
              {t(`${I18N_PATH}PublishNotice`)}
            </Typography>
          </Typography>
        </Layouts.Padding>
        <Divider />
        <Layouts.Padding top="3" bottom="3" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={onClose}>{t(`${I18N_ROOT_PATH}Cancel`)}</Button>
            <Button variant="primary" onClick={submitForm}>
              {t(`${I18N_PATH}Publish`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainer>
  );
};
