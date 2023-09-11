/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { sessionLogout, selectCurrentUser } from '@root/state/modules/session';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import { AdminNav, AdminTopbar } from '@root/scenes/Admin/components';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { history } from '@root/utils/history';
import Footer from '@root/components/Footer';
import { AdminLayout, AdminMain, AdminContent } from '@root/scenes/Admin/components/Layout';
import routes from './routes';

// type Props = {
//   user: UserType,
//   fetchSettingByKey: string => void,
//   fetchConstantsIfNeeded: () => void,
//   history: BrowserHistory,
// };

export class Admin extends PureComponent {
  componentDidMount() {
    if (typeof this.props.fetchSettingByKey === 'function') {
      this.props.fetchSettingByKey('map');
    }
    if (typeof this.props.fetchConstantsIfNeeded === 'function') {
      this.props.fetchConstantsIfNeeded();
    }
    history.push(
      window.location.pathname === '/configuration/inventory-board'
        ? '/configuration/inventory-board'
        : '/configuration/materials',
    );
  }

  render() {
    const { user, sessionLogout } = this.props;
    return (
      <AdminLayout data-name="admin-layout">
        <AdminTopbar user={user} handleLogOut={sessionLogout} />
        <AdminMain>
          <AdminNav />
          <AdminContent>{routes}</AdminContent>
        </AdminMain>
        <Footer />
      </AdminLayout>
    );
  }
}

const mapStateToProps = (state) => ({
  user: selectCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  sessionLogout: () => dispatch(sessionLogout()),
  fetchConstantsIfNeeded: () => dispatch(fetchConstantsIfNeeded()),
  fetchSettingByKey: (key) => dispatch(fetchSettingByKey(key)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin));
