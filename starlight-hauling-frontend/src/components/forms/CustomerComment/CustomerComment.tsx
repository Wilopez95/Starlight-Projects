import React from 'react';
import { Button } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { FormInput } from '@root/common';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { useStores, useUserContext } from '@root/hooks';
import { CustomerCommentRequest } from '@root/types';

import { IForm } from '../types';

import { TypeFormik } from '../../FormContainer/types';
import { getValues, validationSchema } from './formikData';

import styles from './css/styles.scss';

const CommentForm: React.FC<IForm<CustomerCommentRequest>> = ({ onSubmit, onClose }) => {
  const { customerCommentStore } = useStores();
  const { currentUser } = useUserContext();
  const currentComment = customerCommentStore.selectedEntity;

  const formik: TypeFormik = useFormik<CustomerCommentRequest>({
    initialValues: getValues(currentUser!.id, currentComment),
    onSubmit,
    onReset: onClose,
    validateOnChange: false,
    validationSchema,
  });

  const { values, handleChange, errors } = formik;

  const title = currentComment ? 'Edit Comment' : 'Create New Comment';

  return (
    <div className={styles.container}>
      <h2 className={styles.formTitle}>{title}</h2>
      <FormContainer className={styles.form} formik={formik}>
        <FormInput
          name="content"
          label="Comment*"
          className={styles.commentContent}
          onChange={handleChange}
          value={values.content}
          error={errors.content as string}
          area
        />
        <div className={styles.controls}>
          <Button type="reset">Cancel</Button>
          {currentComment ? (
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          ) : (
            <Button type="submit" variant="success">
              Create New
            </Button>
          )}
        </div>
      </FormContainer>
    </div>
  );
};

export default CommentForm;
