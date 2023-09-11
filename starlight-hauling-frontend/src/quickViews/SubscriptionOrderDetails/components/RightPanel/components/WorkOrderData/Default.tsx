import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts, TimePicker } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { FormInput, ValidationMessageBlock } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useDateIntl } from '@root/helpers/format/date';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableSubscriptionOrder } from '@root/types';

import MediaFilesSection from './MediaFilesSection';
import { type IWorkOrderDataProps } from './types';

const I18N_PATH = 'Form.WorkOrderData.Text.';

const DefaultWorkOrderData: React.FC<IWorkOrderDataProps> = ({ oneTime }) => {
  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  const { values, handleChange, errors, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionOrder>();

  return (
    <>
      <Calendar
        label={t(`${I18N_PATH}CompletionDate`)}
        name="completionDate"
        onDateChange={setFieldValue}
        value={values?.completionDate}
        error={errors.completionDate}
        withInput
        firstDayOfWeek={firstDayOfWeek}
        dateFormat={dateFormat}
        formatDate={formatDate}
        readOnly
      />
      <FormInput
        label={`${t(`${I18N_PATH}Truck`)} #`}
        name="truck"
        value={values.truck}
        onChange={handleChange}
        error={errors.truck}
        disabled
      />
      <FormInput
        label={t(`Weight`)}
        name="weight"
        value={values?.weight}
        onChange={handleChange}
        disabled
      />
      <FormInput
        label={`${t(`${I18N_PATH}DroppedEquipment`)} #`}
        name="droppedEquipmentItem"
        value={values?.droppedEquipmentItem}
        onChange={handleChange}
        error={errors.droppedEquipmentItem}
      />
      <FormInput
        label={`${t(`${I18N_PATH}Route`)} #`}
        name="assignedRoute"
        value={values.assignedRoute}
        onChange={handleChange}
        error={errors.assignedRoute}
        disabled
      />

      {oneTime ? (
        <>
          <TimePicker
            label={t(`${I18N_PATH}StartWorkOrderTime`)}
            name="startedAt"
            value={values.startedAt}
            onChange={setFieldValue}
            error={errors.startedAt}
            disabled
          />
          <TimePicker
            label={t(`${I18N_PATH}ArriveOnSite`)}
            name="arrivedAt"
            value={values.arrivedAt}
            onChange={setFieldValue}
            error={errors.arrivedAt}
            disabled
          />
          <TimePicker
            label={t(`${I18N_PATH}StartServiceTime`)}
            name="startServiceDate"
            value={values.startServiceDate}
            onChange={setFieldValue}
            error={errors.startServiceDate}
            disabled
          />
          <TimePicker
            label={t(`${I18N_PATH}FinisWorkOrder`)}
            name="finishWorkOrderDate"
            value={values.finishWorkOrderDate}
            onChange={setFieldValue}
            error={errors.finishWorkOrderDate}
            disabled
          />
        </>
      ) : (
        <TimePicker
          label={t(`${I18N_PATH}CompletionTime`)}
          name="completionTime"
          value={values.completionTime}
          onChange={setFieldValue}
          error={errors.completionTime}
          disabled
        />
      )}

      <Layouts.Cell left="1" width={4}>
        <ValidationMessageBlock color="primary" shade="desaturated" textColor="secondary">
          {t(`${I18N_PATH}DetailedInformationCompletionTime`)}
        </ValidationMessageBlock>
      </Layouts.Cell>
      <Layouts.Cell left="1" width={4}>
        <Divider both />
      </Layouts.Cell>
      <Layouts.Cell left="3" width={2}>
        <MediaFilesSection />
      </Layouts.Cell>

      <Layouts.Cell left="1" width={4}>
        <Divider both={!values.mediaFiles?.length} bottom={!!values.mediaFiles?.length} />
      </Layouts.Cell>
    </>
  );
};

export default DefaultWorkOrderData;
