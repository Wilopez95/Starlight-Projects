import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { subDays } from 'date-fns';
import { useFormik } from 'formik';
import { capitalize } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '@root/common';
import { FormContainer } from '@root/components';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useIntl } from '@root/i18n/useIntl';

import { Divider } from '../../../../../common/TableTools';
import { useDateIntl } from '../../../../../helpers/format/date';
import { useStores } from '../../../../../hooks';
import { GenerationJobService } from '../../../shared/api';

import { generateValidationSchema } from './formikData';
import { type IRequestSettlementData, type IRequestSettlementModal } from './types';

import styles from './css/styles.scss';

const initialDate = subDays(new Date(), 1);

const I18N_PATH = 'modules.billing.Settlements.components.RequestSettlement.Text.';

const RequestSettlementModal: React.FC<IRequestSettlementModal> = ({
  businessUnitId,
  availableMerchants,
  isOpen,
  onClose,
}) => {
  const { settlementStore } = useStores();
  const generationJobService = useRef(new GenerationJobService());
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [generationJobId, setGenerationJob] = useState<string>();
  const intervalHandle = useRef<number | null>(null);
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const stopCheckingJobResult = useCallback(() => {
    if (intervalHandle.current !== null) {
      window.clearInterval(intervalHandle.current);
      intervalHandle.current = null;
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setFailed(false);
    setLoading(false);
    setGenerationJob(undefined);
    stopCheckingJobResult();
    onClose?.();
  }, [onClose, stopCheckingJobResult]);

  const handleSubmit = useCallback(
    async (values: IRequestSettlementData) => {
      setLoading(true);
      const generationJobIdData = await settlementStore.createSettlement(values);

      if (generationJobIdData) {
        setGenerationJob(generationJobIdData);
      } else {
        setLoading(false);
      }
    },
    [settlementStore],
  );

  useEffect(() => {
    if (failed) {
      NotificationHelper.error('create', ActionCode.UNKNOWN, 'Settlement');
      handleModalClose();
    }
  }, [failed, handleModalClose]);

  useEffect(() => {
    const checkGenerationJobResult = async (generationJobIdData: string) => {
      try {
        const response = await generationJobService.current.getJobStatus({
          id: generationJobIdData,
        });

        const { generationJobStatus } = response;

        if (
          generationJobStatus?.status === 'FINISHED' ||
          (generationJobStatus &&
            generationJobStatus.expectedCount ===
              generationJobStatus.failedCount + generationJobStatus.count)
        ) {
          stopCheckingJobResult();

          const jobResultResponse = await generationJobService.current.getSettlementsResult({
            id: generationJobIdData,
          });

          if (jobResultResponse.settlementGenerationJob) {
            settlementStore.requestById(jobResultResponse.settlementGenerationJob.settlementId);
            setLoading(false);

            NotificationHelper.success('create', 'Settlement');
            handleModalClose();
          } else {
            setFailed(true);
          }
        }
      } catch {
        stopCheckingJobResult();
        setFailed(true);
      }
    };

    if (generationJobId && !intervalHandle.current) {
      intervalHandle.current = window.setInterval(() => {
        checkGenerationJobResult(generationJobId);
      }, 3000);
    }
  }, [stopCheckingJobResult, generationJobId, settlementStore, handleModalClose]);

  useEffect(() => () => stopCheckingJobResult(), [stopCheckingJobResult]);

  const formik = useFormik({
    initialValues: { businessUnitId, merchantId: -1, date: initialDate, mid: '', selectValue: '' },
    validationSchema: generateValidationSchema(t),
    validateOnChange: false,
    onSubmit: handleSubmit,
    onReset: handleModalClose,
  });

  const { values, errors, setFieldValue, setValues } = formik;
  const { dateFormat } = useDateIntl();

  const merchantOptions: ISelectOption[] = availableMerchants.reduce<ISelectOption[]>(
    (acc, cur) => {
      const stepOptions: ISelectOption[] = [];

      if (cur.mid) {
        stepOptions.push({
          value: `${cur.id} ${cur.mid} Core`,
          label: `${capitalize(cur.paymentGateway)}, ${t('Text.Core')} ${t('Text.MerchantID')}`,
          hint: cur.mid,
        });
      }

      if (cur.salespointMid) {
        stepOptions.push({
          value: `${cur.id} ${cur.salespointMid} SalesPoint`,
          label: `${capitalize(cur.paymentGateway)}, ${t('Text.SalesPoint')} ${t(
            'Text.MerchantID',
          )}`,
          hint: cur.salespointMid,
        });
      }

      return [...acc, ...stepOptions];
    },
    [],
  );

  const handleChangeMerchantId = useCallback(
    (_, value: string) => {
      const [merchantId, mid] = value.split(' ');

      setValues(valuesData => ({
        ...valuesData,
        mid,
        merchantId: +merchantId,
        selectValue: value,
      }));
    },
    [setValues],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <FormContainer formik={formik}>
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">{t(`${I18N_PATH}Title`)}</Typography>
        </Layouts.Padding>
        <Layouts.Padding left="5" right="5">
          <Calendar
            name="date"
            label={t(`${I18N_PATH}SelectDate`)}
            withInput
            maxDate={initialDate}
            value={values?.date}
            placeholder={t('Text.SetDate')}
            firstDayOfWeek={firstDayOfWeek}
            dateFormat={dateFormat}
            onDateChange={setFieldValue}
            error={errors.date}
          />

          <Select
            label={t(`${I18N_PATH}Merchant`)}
            nonClearable
            name="merchantId"
            value={values.selectValue}
            onSelectChange={handleChangeMerchantId}
            options={merchantOptions}
            error={errors.merchantId}
          />
        </Layouts.Padding>

        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={loading}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" disabled={loading} variant="success">
              {t(`${I18N_PATH}Create`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </FormContainer>
    </Modal>
  );
};

export default observer(RequestSettlementModal);
