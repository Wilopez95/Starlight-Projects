/* eslint-disable react/prop-types */

import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import styled from 'styled-components';
import { createTemplate, uploadLogo, clearPreviewImage } from '@root/state/modules/templates';
import { AdminHeader, AdminInner } from '@root/scenes/Admin/components/Layout';
import { DropZone } from '@root/forms/elements/DropZone';
import { Container, Label, Form } from '@root/components/index';
import Input from '@root/components/Form/Input';

import { FormRow } from '@root/forms/elements/layout';

import './style.module.css';

const mapState = ({ setting, templates }) => ({ setting, templates });
const Text = styled.span`
  color: #fff;
  size: 14px;
`;
const ErrorBox = styled.div`
  background: #d0021b;
  border-radius: 5px;
  font-size: 16px;
  color: #ffffff;
  text-align: center;
  padding: 4px 10px;
  margin-top: 2px;
  margin-bottom: 19px;
`;
const FileUploadWrapper = styled.div`
  label {
    color: #243140;
    display: block;
    font-size: 16px;
    font-weight: 200;
    margin-bottom: 10px;
  }
  &.disabled {
    .dropzone {
      cursor: not-allowed;
      background-color: #dee0e3 !important;
      border: 1px solid #dee0e3 !important;
    }
  }
`;

// type Props = {
//   createTemplate: Function,
//   uploadLogo: Function,
//   history: History,
// };

const validationSchema = yup.object().shape({
  name: yup.string().required().max(128).label('Name'),
  acknowledgement: yup.string().required().label('Acknowledgement'),
  logo: yup.string().required().label('Logo'),
});

// eslint-disable-next-line
export class CreateTemplate extends Component {
  onOpenClick() {
    this.dropzone.open();
  }

  renderErrors = (touched, errors, field) => {
    // Render feedback if this field's been touched and has errors
    if (touched[field] && errors[field]) {
      return (
        <ErrorBox>
          <Text>{errors[field]}</Text>
        </ErrorBox>
      );
    }

    // Otherwise, don't render anything
    return null;
  };

  renderFileUpload = (field, form) => {
    const { setFieldValue } = form;

    return (
      <DropZone
        setFieldValue={setFieldValue}
        url={form.values.logo}
        name="logo"
        accept="image/*"
        multiple={false}
        className="dropzone"
        activeClassName="active"
        uploadLogo={this.props.uploadLogo}
        disabled={false}
      />
    );
  };

  render() {
    return (
      <Fragment>
        <AdminHeader title="Template Editor" isCenter />
        <Container>
          <AdminInner isWide>
            <Formik
              initialValues={{
                name: '',
                description: '',
                // content: '',
                acknowledgement: '',
                logo: '',
              }}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(false);
                await this.props.createTemplate(values);

                this.props.history.push('/configuration/templates');
              }}
              validationSchema={validationSchema}
              validateOnBlur
              validateOnChange
              // eslint-disable-next-line complexity
              render={({ errors, touched, isValid, isSubmitting }) => (
                <Form>
                  <FormRow>
                    <Input name="name" label="Name" placeholder="Name of the template" />
                  </FormRow>
                  <FormRow>
                    <Input
                      name="description"
                      label="Description"
                      placeholder="The purpose of the template"
                    />
                  </FormRow>
                  <FormRow>
                    <Label>Logo</Label>
                    <FileUploadWrapper>
                      <Field
                        id="logo"
                        name="logo"
                        render={({ field, form }) => this.renderFileUpload(field, form)}
                      />
                    </FileUploadWrapper>
                    {this.renderErrors(touched, errors, 'logo')}
                  </FormRow>
                  <FormRow>
                    <Input
                      name="acknowledgement"
                      label="Acknowledgement statement"
                      placeholder="By digitally signing this statement I agree to the terms"
                    />
                  </FormRow>
                  <footer className="form-actions">
                    <button
                      className="btn btn__default btn__lg"
                      type="submit"
                      disabled={!isValid || isSubmitting}
                    >
                      Save
                    </button>
                  </footer>
                </Form>
              )}
            />
          </AdminInner>
        </Container>
      </Fragment>
    );
  }
}

export default connect(mapState, {
  createTemplate,
  uploadLogo,
  clearPreviewImage,
})(CreateTemplate);
