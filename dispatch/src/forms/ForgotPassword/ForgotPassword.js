import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { Field, Formik } from 'formik';
import FormError from '../elements/form-error';

class ForgotPassword extends PureComponent {
  static propTypes = {
    handleSubmitForm: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      error: false,
      disabled: false,
    };
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  async onValidSubmit({ email }) {
    const { handleSubmitForm, onSuccess } = this.props;

    this.disabledSubmit();
    this.setState({ error: false });

    try {
      await handleSubmitForm(email);
      this.enableSubmit();
      onSuccess();
      // history.push('/login')
    } catch (error) {
      this.enableSubmit();
      this.setState({ error });
    }
  }

  enableSubmit = () => {
    this.setState({ disabled: false });
  };

  disabledSubmit = () => {
    this.setState({ disabled: true });
  };

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  render() {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          email: '',
        }}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit }) => (
          <form className="form__login" style={{ backgroundColor: 'white', textArea: 'white' }}>
            {this.state.error ? <FormError error={this.state.error} /> : null}
            <div
              className="input-container"
              style={{
                display: 'flex',
                width: '100%',
                marginBottom: '15px',
              }}
            >
              <i
                className="fa fa-envelope icon"
                style={{
                  padding: '10px',
                  background: '#e87900',
                  color: 'white',
                  minWidth: '50px',
                  textAlign: 'center',
                }}
              />
              <Field
                name="email"
                type="email"
                className="input-field"
                style={{ width: '100%', padding: '10px', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn__success btn__lg"
              disabled={this.state.disabled || !this.validateEmail(values.email)}
              style={{
                width: '100%',
                color: 'white',
                textAlign: 'center',
                fontSize: '1.2em',
                backgroundColor: '#e87900',
                borderRadius: '0px',
                marginBottom: '10px',
              }}
            >
              Send recovery email
            </button>
          </form>
        )}
      </Formik>
    );
  }
}

export default ForgotPassword;
