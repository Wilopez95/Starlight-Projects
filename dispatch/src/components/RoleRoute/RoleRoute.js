/* eslint-disable react/prop-types */

import { connect } from 'react-redux';
import { withRouter, Route, Redirect } from 'react-router-dom';

// type Props = {
//   component: Function,
//   isAuthenticated: boolean,
//   location: Object,
//   roleId: number,
// };
const RoleRoute = ({ component: Component, isAuthenticated, roleId, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated && roleId > 5 ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/inventory-board',
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
    roleId: state.session.user.roleId,
  };
}

function mapDispatchToProps() {
  return {};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoleRoute));
