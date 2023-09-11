import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, MonthPicker, Select } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { useFormik, useFormikContext } from 'formik';
import { isEmpty, noop } from 'lodash-es';

import { Modal, Typography } from '@root/common';
import { FormContainerLayout } from '@root/components/forms/layout/FormContainer';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ITruckAndDriverCost } from '@root/types';

import {
  getDuplicatedDriverCosts,
  getDuplicatedTruckCosts,
  getDuplicatedTruckTypeCosts,
} from '../../helpers';

import { generateValidationSchema, getValues } from './formikData';
import { IConfirmTruckAndDriverCostData, IConfirmTruckAndDriverCostExist } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.';

const ConfirmTruckAndDriverCostExist: React.FC<IConfirmTruckAndDriverCostExist> = ({
  businessUnitOptions,
  isOpen,
  onClose,
  date,
  businessUnitId,
  openWarningModal,
  onDuplicate,
  setValuesForDuplicating,
}) => {
  const { dateFormat } = useIntl();
  const { t } = useTranslation();
  const { truckAndDriverCostStore, driverStore, truckStore, truckTypeStore } = useStores();
  const selectedTruckAndDriverCosts = truckAndDriverCostStore.selectedEntity;

  const formik = useFormik({
    validationSchema: generateValidationSchema(t, `${I18N_PATH}ValidationErrors.`),
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: getValues({ date, businessUnitId }),
    onSubmit: noop,
  });

  const { values, errors, setFieldValue, validateForm } = formik;

  const { values: costsValues, setValues: setCostsValues } =
    useFormikContext<ITruckAndDriverCost>();

  const handleSubmit = useCallback(
    async (data: IConfirmTruckAndDriverCostData) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      const buId = data.businessUnitId ?? null;

      const truckAndDriverCosts = await truckAndDriverCostStore.requestByBusinessUnitOrDate({
        buId,
        date: format(data.date, dateFormat.ISO),
      });

      if (truckAndDriverCosts) {
        const duplicatedValues = {
          ...costsValues,
          date: data.date,
          businessUnitId: buId,
        };

        openWarningModal();
        onClose();
        setValuesForDuplicating(duplicatedValues);
      } else {
        onClose();
        onDuplicate();

        const options = buId
          ? {
              activeOnly: true,
              filterByBusinessUnit: [+buId],
            }
          : { activeOnly: true };

        truckTypeStore.cleanup();
        const truckTypes = await truckTypeStore.requestAll(options);

        truckStore.cleanup();
        const trucks = await truckStore.requestAll(options);

        driverStore.cleanup();
        const drivers = await driverStore.requestAll(options);

        setCostsValues({
          ...costsValues,
          date: data.date,
          businessUnitId: buId,
          truckTypeCosts: buId
            ? getDuplicatedTruckTypeCosts(truckTypes, selectedTruckAndDriverCosts?.truckTypeCosts)
            : selectedTruckAndDriverCosts?.truckTypeCosts,
          truckCosts: buId
            ? getDuplicatedTruckCosts(trucks, selectedTruckAndDriverCosts?.truckCosts)
            : selectedTruckAndDriverCosts?.truckCosts,
          driverCosts: buId
            ? getDuplicatedDriverCosts(drivers, selectedTruckAndDriverCosts?.driverCosts)
            : selectedTruckAndDriverCosts?.driverCosts,
        });
      }
    },
    [
      selectedTruckAndDriverCosts,
      truckAndDriverCostStore,
      driverStore,
      truckTypeStore,
      truckStore,
      validateForm,
      dateFormat.ISO,
      onClose,
      onDuplicate,
      openWarningModal,
      costsValues,
      setCostsValues,
      setValuesForDuplicating,
    ],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <FormContainerLayout formik={formik}>
        <Layouts.Padding padding="3" bottom="4">
          <Layouts.Padding bottom="3">
            <Typography variant="headerThree"> {t('Text.Duplicate')}</Typography>
          </Layouts.Padding>
          <Layouts.Box maxWidth="180px" width="100%">
            <MonthPicker
              label={t(`${I18N_PATH}Text.EffectivePeriod`)}
              name="date"
              placeholder={t(`${I18N_PATH}Text.SetDate`)}
              error={errors.date}
              value={values.date}
              format={dateFormat.dateMonthYear}
              onChange={setFieldValue}
            />
          </Layouts.Box>
          <Select
            label={t(`${I18N_PATH}Text.BusinessUnit`)}
            name="businessUnitId"
            options={businessUnitOptions}
            value={values.businessUnitId ?? 0}
            onSelectChange={setFieldValue}
            nonClearable
          />
          <Layouts.Padding top="2">
            <Layouts.Box as={Layouts.Flex} justifyContent="space-between">
              <Button onClick={onClose}>{t('Text.Cancel')}</Button>
              <Button type="submit" onClick={() => handleSubmit({ ...values })} variant="primary">
                {t('Text.Duplicate')}
              </Button>
            </Layouts.Box>
          </Layouts.Padding>
        </Layouts.Padding>
      </FormContainerLayout>
    </Modal>
  );
};

export default ConfirmTruckAndDriverCostExist;
