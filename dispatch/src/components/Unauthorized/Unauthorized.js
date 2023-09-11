/* eslint-disable react/prop-types */
import { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { sessionLogout, makeSelectIsAuth } from '../../state/modules/session';
import Container from '../Container';

const Wrapper = styled.div`
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f1f1f1;
  align-items: center;
  justify-content: center;
  a {
    margin: 0 auto;
    text-align: center;
    display: flex;
    justify-content: center;
  }
`;

const H1 = styled.h1`
  font-size: 20vh;
  font-weight: 600;
  position: relative;
  margin: -8vh 0 0;
  padding: 0;
  color: #222;
  text-align: center;
  &:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: transparent;
    background: -webkit-repeating-linear-gradient(
      -45deg,
      #71b7e6,
      #69a6ce,
      #b98acc,
      #ee8176,
      #b98acc,
      #69a6ce,
      #9b59b6
    );
    background-size: 400%;
    text-shadow: 1px 1px 2px transparentize(#fff, 0.75);
    animation: animateTextBackground 10s ease-in-out infinite;
  }
`;
const Text = styled.p`
  color: #222;
  font-size: 3vh;
  font-weight: bold;
  line-height: 10vh;
  max-width: 600px;
  position: relative;
  margin-bottom: 50px;
  text-align: center;
  &:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: transparent;
    text-shadow: 1px 1px 2px transparentize(#fff, 0.5);
    background-clip: text;
  }
`;
const LogoutText = styled.p`
  color: #222;
  font-size: 3vh;
  font-weight: bold;
  line-height: 10vh;
  max-width: 600px;
  position: relative;
  margin-bottom: 50px;
  text-align: center;
  &:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: transparent;
    text-shadow: 1px 1px 2px transparentize(#fff, 0.5);
    background-clip: text;
  }
  &:hover {
    color: #1976d2;
    text-decoration: underline;
  }
`;
const Flex = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
// type Props = {
//   isAuthorized: boolean,
//   sessionLogout: () => void,
// };

class Unauthorized extends PureComponent {
  handleLogout = () => {
    this.props.sessionLogout();
  };

  render() {
    return (
      <Wrapper>
        <Flex alignItems="center" justifyContent="center">
          <Container>
            <H1>401</H1>
            <Text>Sorry, you do not have permission to enter dispatch.</Text>
            {this.props.isAuthorized ? (
              <LogoutText onClick={this.handleLogout}>Logout</LogoutText>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </Container>
        </Flex>
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthorized: makeSelectIsAuth(state),
});
const mapDispatchToProps = (dispatch) => ({
  sessionLogout: () => dispatch(sessionLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Unauthorized);
