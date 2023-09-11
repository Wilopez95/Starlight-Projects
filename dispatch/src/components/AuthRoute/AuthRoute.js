/* eslint-disable react/prop-types */

import { connect } from 'react-redux';
import { withRouter, Route, Redirect } from 'react-router-dom';

// type Props = {
//   component: Function,
//   isAuthenticated: boolean,
//   location: Object,
// };
const AuthRoute = ({ component: Component, isAuthenticated, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

function mapStateToProps(state) {
  return {
    isAuthenticated: state.session.isAuthorized,
  };
}

function mapDispatchToProps() {
  return {};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuthRoute));
