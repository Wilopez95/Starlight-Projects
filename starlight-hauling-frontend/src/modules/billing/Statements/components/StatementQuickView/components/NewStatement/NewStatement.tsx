import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts } from '@starlightpro/shared-components';
import { endOfDay, endOfToday, endOfYesterday } from 'date-fns';
import { useFormik, useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../../common';
import { Divider } from '../../../../../../../common/TableTools';
import { FormContainer } from '../../../../../../../components';
import { useDateIntl } from '../../../../../../../helpers/format/date';
import { useScrollOnError, useStores } from '../../../../../../../hooks';
import { type INewStatement } from '../../../../types';
import { getValues, validationSchema } from '../../formikData';
import Loader from '../Loader/Loader';

const today = endOfToday();
const yesterday = endOfYesterday();

const NewStatement: React.FC<{ loading: boolean }> = ({ loading }) => {
  const { customerStore, statementStore } = useStores();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedStatement = statementStore.selectedEntity;

  const formik = useFormik({
    validationSchema,
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: getValues(selectedStatement),
    onSubmit: noop,
  });

  const [minEndDate, setMinEndDate] = useState<Date | undefined>();

  const { errors, values, isValidating, setFieldValue } = useFormikContext<INewStatement>();

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    if (selectedCustomer && !minEndDate) {
      (async () => {
        const endDate =
          (await statementStore.requestStatementEndDate(selectedCustomer.id)) ?? today;

        setMinEndDate(endDate);
      })();
    }
  }, [minEndDate, selectedCustomer, statementStore]);

  const handleDateChange = useCallback(
    (name: string, date: Date | null) => {
      setFieldValue(name, endOfDay(date ?? today));
    },
    [setFieldValue],
  );

  const { dateFormat } = useDateIntl();

  return (
    <FormContainer formik={formik}>
      <Layouts.Margin top="1">
        <Typography variant="headerThree">New Statement</Typography>
      </Layouts.Margin>
      <Divider both />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Layouts.Flex>
            <Layouts.Flex as={Layouts.Box} alignItems="center" width="50%">
              <Layouts.Margin bottom="3">
                <Typography
                  as="label"
                  htmlFor="statementDate"
                  variant="bodyMedium"
                  color="secondary"
                  shade="desaturated"
                >
                  Statement Date*
                </Typography>
              </Layouts.Margin>
            </Layouts.Flex>
            <Calendar
              withInput
              name="statementDate"
              value={values.statementDate}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={handleDateChange}
              error={errors.statementDate}
              minDate={values.endDate}
              maxDate={today}
            />
          </Layouts.Flex>
          <Layouts.Flex>
            <Layouts.Flex as={Layouts.Box} alignItems="center" width="50%">
              <Layouts.Margin bottom="3">
                <Typography
                  as="label"
                  htmlFor="endDate"
                  variant="bodyMedium"
                  color="secondary"
                  shade="desaturated"
                >
                  End Date*
                </Typography>
              </Layouts.Margin>
            </Layouts.Flex>
            <Calendar
              withInput
              name="endDate"
              value={values.endDate}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={handleDateChange}
              error={errors.endDate}
              minDate={minEndDate}
              maxDate={yesterday}
            />
          </Layouts.Flex>
        </>
      )}
    </FormContainer>
  );
};

export default NewStatement;
