import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainer,
  FormInput,
  Layouts,
  Select,
  Typography,
} from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { Divider } from '@root/common/TableTools';
import { CancellationReason as CancellationReasonEnum, Maybe } from '@root/types';
import { FormDataType, getInitialValues, validationSchema } from './formikData';
import { Modal } from './styles';
import { ICancellationReason } from './types';

const I18N_PATH = 'components.modals.CancellationReason.Text.';
const I18N_PATH_ROOT = 'Text.';
const I18N_PATH_PLACEHOLDERS = 'components.modals.CancellationReason.Placeholders.';

export const CancellationReason: React.FC<ICancellationReason> = ({
  isOpen,
  cancellationReason,
  cancellationComment,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const onFormSubmit = (values: FormDataType) => {
    const cancellReason = values.cancellationReason;
    const cancellReasonComment = values.cancellationComment;

    if (cancellationReason === CancellationReasonEnum.Other) {
      onSubmit(cancellationReason, cancellReasonComment);
      return;
    }
    onSubmit(cancellReason);
  };

  interface CancellationReasonType {
    cancellationReason?: string;
    cancellationComment?: string | undefined;
  }

  let values: CancellationReasonType = {};

  const validateComment = (value?: Maybe<string>) => {
    return !!(values.cancellationReason !== CancellationReasonEnum.Other || value);
  };

  const formik = useFormik({
    initialValues: getInitialValues(cancellationReason, cancellationComment),
    onSubmit: onFormSubmit,
    enableReinitialize: true,
    validationSchema: validationSchema(validateComment, t),
  });

  const { errors, setFieldValue, handleChange, handleSubmit } = formik;
  values = formik.values;

  const cancellationReasonOptions = useMemo(() => {
    const options = Object.values(CancellationReasonEnum).map(value => ({
      label: t(``),
      value,
    }));
    return options;
  }, [t]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Layouts.Padding top="4" bottom="4" left="5" right="5">
        <Typography color="default" as="label" shade="standard" variant="headerThree">
          {t(`${I18N_PATH}Title`)}
        </Typography>
        <Layouts.Margin top="1">
          <FormContainer formik={formik}>
            <Select
              name="cancellationReason"
              label={t(`${I18N_PATH}CancellationReason`)}
              placeholder={t(`${I18N_PATH_PLACEHOLDERS}CancellationReason`)}
              nonClearable
              options={cancellationReasonOptions}
              value={values.cancellationReason}
              error={errors.cancellationReason}
              onSelectChange={setFieldValue}
            />
            {values.cancellationReason === CancellationReasonEnum.Other && (
              <FormInput
                name="cancellationComment"
                label={t(`${I18N_PATH}Comment`)}
                placeholder={t(`${I18N_PATH_PLACEHOLDERS}Comment`)}
                value={values.cancellationComment}
                error={errors.cancellationComment}
                onChange={handleChange}
                area
              />
            )}
          </FormContainer>
        </Layouts.Margin>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding top="3" bottom="3" left="5" right="5">
        <Layouts.Flex justifyContent="space-between">
          <Button variant="white" onClick={onClose}>
            {t(`${I18N_PATH_ROOT}NeverMind`)}
          </Button>
          <Button variant="alert" onClick={() => handleSubmit()}>
            {t(`${I18N_PATH_ROOT}ConfirmCancellation`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};
