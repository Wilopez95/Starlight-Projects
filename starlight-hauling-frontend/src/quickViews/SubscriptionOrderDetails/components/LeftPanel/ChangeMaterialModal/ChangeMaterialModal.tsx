import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormik, useFormikContext } from 'formik';
import { TFunction } from 'i18next';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import * as Yup from 'yup';

import { FormInput, Modal, Typography } from '@root/common';
import { IModal } from '@root/common/Modal/types';
import { Divider } from '@root/common/TableTools';
import FormContainer from '@root/components/FormContainer/FormContainer';
import MaterialSelect from '@root/components/MaterialSelect/MaterialSelect';
import { IConfigurableSubscriptionOrder } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.SubscriptionOrderDetails.components.LeftPanel.ChangeMaterialModal';

const priceValidationSchema = (t: TFunction) =>
  Yup.object().shape({
    price: Yup.number()
      .typeError(t(`${I18N_PATH}.ValidationErrors.Number`))
      .positive(t(`${I18N_PATH}.ValidationErrors.GreaterThanZero`))
      .required(t(`${I18N_PATH}.ValidationErrors.Required`)),
  });

const ChangeMaterialModal: React.FC<IModal> = ({ onClose, isOpen }) => {
  const { values: formValues, setFieldValue: formSetValues } =
    useFormikContext<IConfigurableSubscriptionOrder>();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      price: (formValues.price ?? 1).toString(),
      materialId: formValues.materialId,
      equipmentItemId: formValues.equipmentItemId,
      customRatesGroupServicesId: formValues.customRatesGroupServicesId,
      billableServiceId: formValues.billableServiceId,
    },
    enableReinitialize: true,
    validationSchema: priceValidationSchema(t),
    validateOnChange: false,
    onSubmit: async (val, helpers) => {
      const errors = await helpers.validateForm();

      if (!isEmpty(errors)) {
        return;
      }

      formSetValues('price', +val.price);
      formSetValues('materialId', val.materialId);
      onClose?.();
    },
  });

  const { errors, values, handleChange, handleSubmit } = formik;

  const billableServiceOption: ISelectOption[] = [
    {
      value: 'default',
      label: formValues.billableService?.description ?? '',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onClose={onClose}
    >
      <FormContainer formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">{t(`${I18N_PATH}.Text.ServiceSettings`)}</Typography>
          </Layouts.Padding>
          <Layouts.Padding padding="5">
            <Layouts.Flex>
              <div className={styles.select}>
                <Select
                  label={t('Text.Service')}
                  name="default"
                  onSelectChange={noop}
                  options={billableServiceOption}
                  value="default"
                  disabled
                />
              </div>
              <div className={styles.select}>
                <MaterialSelect
                  name="materialId"
                  businessLineId={formValues.businessLineId}
                  label={t('Text.Material')}
                  value={values.materialId ?? ''}
                  error={errors.materialId}
                />
              </div>
              <FormInput
                name="materialPrice"
                label={`${t('Text.Price')}*`}
                onChange={handleChange}
                wrapClassName={styles.price}
                value={values.price}
                error={errors.price}
              />
            </Layouts.Flex>
          </Layouts.Padding>
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit as () => void} variant="primary">
                {t(`Text.SaveChanges`)}
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainer>
    </Modal>
  );
};

export default observer(ChangeMaterialModal);
