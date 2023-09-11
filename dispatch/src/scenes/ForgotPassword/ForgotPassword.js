/* eslint-disable no-irregular-whitespace */
import { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Footer from '@root/components/Footer';
import { restore } from '@root/helpers/auth';
import ForgotPasswordForm from '../../forms/ForgotPassword';
import styles from './style.module.css';

const LoginPage = styled.div`
  width: 100%;
  position: relative;
  margin: 0;
  height: auto !important;
  align-items: center;
`;

const LoginWrapper = styled.div`
  width: 510px;
  padding-top: 75px;
  margin: 100px auto 0px auto;
  text-align: center;
  background-color: #fff;
  border-radius: 4px;
  height: auto !important;
  box-shadow: 0 2px 8px 0 rgba(33, 43, 54, 0.1);
  form {
    margin-bottom: 14px;
  }
`;

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 10px;
`;

const LogoImg = styled.img`
  display: inline-block;
  vertical-align: top;
  max-width: 200px;
`;

const LoginFormFooter = styled.div`
  width: 100%;
  /* border-radius: 4px; */
  padding: 0.5em;
  border: solid 1px #dfe3e8;
  background-color: #f9fafb;
`;

const LoginText = styled.h1`
  color: #e87900;
  padding-top: 20px;
  font-size: 20px;
  text-align: center;
  font-weight: 700;
  paddingbottom: 20px;
`;

// type Props = {
//   history: History,
// };

class ForgotPassword extends Component {
  static displayName = 'ForgotPassword';

  static propTypes = {
    history: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = { submitted: false };
  }

  onNavigateHome = () => {
    setTimeout(() => {
      this.props.history.push('/login');
    }, 5000);
  };

  showSuccessMessage = () => {
    this.setState((prevState) => ({
      submitted: !prevState.submitted,
    }));
    // after successful email send redirect after user has time to read validation back to login page)
    this.onNavigateHome();
  };

  render() {
    return (
      <LoginPage>
        <LoginWrapper>
          <LogoArea>
            <LogoImg
              src="https://cdn.starlightpro.com/starlight-logo-plain.png"
              alt="starlightpro logo"
            />
          </LogoArea>
          <LoginText className="login-text">Reset Password</LoginText>
          {this.state.submitted ? (
            <div data-name="success" className={styles.restorePasswordSuccess}>
              <p>
                <strong>Success!</strong> We just sent you an email with a link to setup your new
                password.
                <br />
                We are redirecting you back to login shortly. If you are not redirected please{' '}
                <Link to="/login">click here</Link>
              </p>
            </div>
          ) : (
            <div className={styles.restorePasswordForm}>
              <ForgotPasswordForm
                handleSubmitForm={restore}
                onSuccess={this.showSuccessMessage}
                onClick={this.onNavigateHome}
              />
            </div>
          )}
          <LoginFormFooter>
            <Link to="/login">Back to Login Screen</Link>
          </LoginFormFooter>
        </LoginWrapper>
        <Footer />
      </LoginPage>
    );
  }
}
export default ForgotPassword;
