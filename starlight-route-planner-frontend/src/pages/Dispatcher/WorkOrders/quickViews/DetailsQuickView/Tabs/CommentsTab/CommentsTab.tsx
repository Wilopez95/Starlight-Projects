import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, Layouts, TextInput } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { useStores } from '@root/hooks';

import { IWorkOrderCommentParams } from '@root/api/workOrderComments';
import { ITabs } from '../types';

import { Comments } from './Comments/Comments';
import { commentValidationSchema, defaultValues } from './formikData';

const I18N_PATH = 'pages.Dispatcher.components.WorkOrders.QuickViews.CommentSection.Text.';

const INPUT_HEIGHT = 149;

export const CommentsTab: React.FC<ITabs> = ({ workOrder, scrollContainerHeight }) => {
  const { id: workOrderId, displayId } = workOrder;
  const { t } = useTranslation();
  const { workOrderCommentsStore } = useStores();

  const createComment = useCallback(
    (values: IWorkOrderCommentParams) => {
      workOrderCommentsStore.createComment(values);
    },
    [workOrderCommentsStore],
  );

  const formik = useFormik({
    initialValues: defaultValues as IWorkOrderCommentParams,
    onSubmit: createComment,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    validationSchema: commentValidationSchema(t),
  });

  const { values, isValid, handleChange, setFieldValue, submitForm, resetForm, validateForm } =
    formik;

  const handleCreateComment = useCallback(async () => {
    setFieldValue('workOrderId', workOrderId);
    await submitForm();
    resetForm();
    validateForm();
  }, [resetForm, setFieldValue, submitForm, workOrderId, validateForm]);

  return (
    <>
      <Comments workOrderId={displayId} height={scrollContainerHeight - INPUT_HEIGHT} />
      <Layouts.Box width="100%" backgroundColor="white" height={`${INPUT_HEIGHT}px`}>
        <FormContainer formik={formik}>
          <Layouts.Padding top="2" bottom="2">
            <TextInput
              name="comment"
              area-label={t(`${I18N_PATH}InputSection`)}
              placeholder={t(`${I18N_PATH}PlaceHolder`)}
              onChange={handleChange}
              value={values.comment}
              noError
              area
            />
          </Layouts.Padding>
          <Button variant="primary" disabled={!isValid} onClick={handleCreateComment} full>
            {t(`${I18N_PATH}AddComment`)}
          </Button>
        </FormContainer>
      </Layouts.Box>
    </>
  );
};
