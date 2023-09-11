import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import { selectCurrentUser } from '@root/state/modules/session';
import { createWorkOrderNote } from '@root/state/modules/workOrderNotes';
import FormError from '../elements/form-error';
import ImageInput from '../elements/ImageInput';
import HiddenInput from '../elements/HiddenInput';

class WorkOrderAddNote extends Component {
  static propTypes = {
    workOrderId: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]),
    dispatch: PropTypes.func,
    user: PropTypes.object,
    isUploading: PropTypes.bool,
  };

  schema = Yup.object().shape({
    text: Yup.string().required('Required'),
  });

  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  async onValidSubmit(data) {
    this.setState({ submitting: true, error: false });

    try {
      await this.props.dispatch(createWorkOrderNote(this.props.workOrderId, data));
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ submitting: false });
    }
  }

  render() {
    const { user, isUploading } = this.props;

    return (
      <Formik
        enableReinitialize
        initialValues={{
          text: '',
          picture: '',
        }}
        validationSchema={this.schema}
        onSubmit={(values) => {
          this.onValidSubmit({
            type: 'NOTE',
            note: {
              text: values.text,
              picture: values.picture,
            },
          });
        }}
      >
        {({ handleSubmit, values, setFieldValue, errors }) => (
          <form className="form form--addWorkOrderNote">
            {this.state.error ? <FormError error={this.state.error} /> : null}
            <div className="form-row">
              <div className="form-col">
                <Field
                  name="text"
                  type="text"
                  placeholder="Type a note here..."
                  className={errors.text ? 'text-input error-required' : 'text-input'}
                />
              </div>
              <div className="form-col">
                <ImageInput
                  id="f-pictures"
                  name="picture"
                  setValue={setFieldValue}
                  value={values.picture}
                />
              </div>
              <div className="form-col">
                <HiddenInput name="createdBy" value={user?.username || ''} />
                <HiddenInput name="type" value="NOTE" />
                <button
                  className="btn btn__success"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={this.state.submitting}
                  style={{ height: '34px' }}
                >
                  {isUploading ? 'Uploading...' : 'Add note'}
                </button>
              </div>
            </div>
          </form>
        )}
      </Formik>
    );
  }
}

const mapState = (state) => ({
  user: selectCurrentUser(state),
  isUploading: state.workOrderNotes.isUploading,
});

export default connect(mapState)(WorkOrderAddNote);
