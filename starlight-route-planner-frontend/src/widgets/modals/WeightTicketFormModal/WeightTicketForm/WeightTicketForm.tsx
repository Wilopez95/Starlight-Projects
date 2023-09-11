import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, Layouts } from '@starlightpro/shared-components';
import { startOfDay } from 'date-fns';
import { useFormik } from 'formik';

import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { IWeightTicketRequestParams } from '@root/stores/WeightTicketStore/types';
import { IWeightTicket } from '@root/types';

import { HeadSection } from './sections/HeadSection/HeadSection';
import { MaterialSection } from './sections/MaterialSection/MaterialSection';
import { TimeSection } from './sections/TimeSection/TimeSection';
import { FormDataType, generateWeightTicketValidationSchema, getInitialValues } from './formikData';
import { getNormalizedData } from './normalize';
import { IWeightTicketFormValues, StyleProps } from './types';

const I18N_PATH = 'components.modals.WeightTicket.Text.';

const styleProps: StyleProps = {
  columnWidth: '140px',
  columnsTemplate: '140px 140px 140px 140px',
  gap: '2',
};

interface IProps {
  isEdit: boolean;
  weightTicketNumberList: string[];
  materialIds?: number[];
  dailyRouteId?: number;
  weightTicket?: IWeightTicket;
  onClose(): void;
  onSubmit(workOrderId: number, weightTicket: IWeightTicketRequestParams): void;
}

export const WeightTicketForm: React.FC<IProps> = ({
  weightTicket,
  dailyRouteId,
  materialIds,
  weightTicketNumberList,
  isEdit = false,
  onClose,
  onSubmit,
}) => {
  const { materialStore } = useStores();
  const { t } = useTranslation();

  const currentDate = useMemo(() => startOfDay(new Date()), []);

  const submitWeightTicket = useCallback(
    (values: IWeightTicketFormValues) => {
      const normalized = getNormalizedData(values, isEdit);

      if (dailyRouteId != null) {
        onSubmit(dailyRouteId, normalized);
        onClose();
      }
    },
    [dailyRouteId, isEdit, onClose, onSubmit],
  );

  const formik = useFormik<FormDataType>({
    initialValues: getInitialValues(currentDate, weightTicket),
    onSubmit: submitWeightTicket,
    enableReinitialize: true,
    validationSchema: generateWeightTicketValidationSchema(t, weightTicketNumberList),
    validateOnChange: false,
  });

  useEffect(() => {
    if (materialIds) {
      materialStore.cleanup();
      materialStore.getHaulingMaterials({ materialIds });
    }
  }, [materialIds, materialStore]);

  return (
    <FormContainer formik={formik}>
      <Layouts.Padding top="4" left="5" right="5" bottom="2">
        <HeadSection isEdit={isEdit} styleProps={styleProps} />
        <Layouts.Padding bottom="1">
          <Divider />
        </Layouts.Padding>
        <TimeSection isEdit={isEdit} styleProps={styleProps} />
        <Layouts.Padding bottom="2">
          <Divider />
        </Layouts.Padding>
        <MaterialSection isEdit={isEdit} styleProps={styleProps} />
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding top="4" bottom="4" left="5" right="5">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}>
            <Layouts.Padding left="3" right="3">
              {t('Text.Cancel')}
            </Layouts.Padding>
          </Button>
          <Button type="submit" variant="primary">
            <Layouts.Padding left="3" right="3">
              {isEdit ? t(`${I18N_PATH}EditTicket`) : t(`${I18N_PATH}AddTicket`)}
            </Layouts.Padding>
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </FormContainer>
  );
};
