/* eslint-disable react/prop-types */
import { Component } from 'react';
import { withFormik, Field } from 'formik';
import styled from 'styled-components';
import { DropZone } from '@root/forms/elements/DropZone';
import { FormRow } from '@root/forms/elements/layout';
import Label from '@root/forms/elements/label';
import Form from '@root/components/Form';
import FontIcon from '@root/components/FontIcon';
import '@root/scenes/Admin/Templates/CreateTemplate/style.module.css';
import Input from '@root/components/Form/Input';

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
const PreviewImage = styled.img`
  height: 100%;
  max-height: 280px;
  transition: all 0.25s ease 0s;
`;
// type Props = {
//   handleSubmit: Function,
//   uploadLogo: Function,
//   isSubmitting: boolean,
//   values: Object,
//   setFieldValue: Function,
// };

// type State = {
//   file?: Object,
// };

class InnerTemplateForm extends Component {
  handleReplaceLogo = setFieldValue => {
    setFieldValue('logo', '');
  };

  renderFileUpload = (field, form) => {
    const { name } = field;
    const { setFieldValue, setFieldTouched, handleReset } = form;
    const formikProps = {
      values: field.values,
      setFieldValue,
      setFieldTouched,
      handleReset,
    };
    return (
      <DropZone
        setFieldValue={setFieldValue}
        formik={formikProps}
        name={name}
        id={name}
        multiple={false}
        className="dropzone"
        activeClassName="active"
        uploadLogo={this.props.uploadLogo}
        disabled={false}
      />
    );
  };

  render() {
    const { handleSubmit, isSubmitting, values, setFieldValue } = this.props;

    return (
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <Input name="name" label="Name" placeholder="Name of the template" />
        </FormRow>
        <FormRow>
          <Input name="description" label="Description" placeholder="The purpose of the template" />
        </FormRow>
        <FormRow>
          <Label>Logo</Label>
          {values.logo ? (
            <>
              <PreviewImage src={values.logo} />
              <FontIcon name="times" onClick={() => this.handleReplaceLogo(setFieldValue)} />
            </>
          ) : (
            <FileUploadWrapper>
              <Field
                id="logo"
                name="logo"
                multiple={false}
                render={({ field, form }) => this.renderFileUpload(field, form)}
              />
            </FileUploadWrapper>
          )}
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
            disabled={!values.name || !values.acknowledgement || !values.logo || isSubmitting}
            onClick={handleSubmit}
          >
            Save
          </button>
        </footer>
      </Form>
    );
  }
}

const TemplateForm = withFormik({
  mapPropsToValues: props => ({
    name: props.template.name,
    description: props.template.description,
    logo: props.template.logo,
    acknowledgement: props.template.acknowledgement,
  }),
  handleSubmit: (values, { props, setSubmitting }) => {
    setTimeout(() => {
      props.updateTemplate(values);
      setSubmitting(false);
    }, 1000);
  },
  displayName: 'TemplateForm',
})(InnerTemplateForm);

export default TemplateForm;
