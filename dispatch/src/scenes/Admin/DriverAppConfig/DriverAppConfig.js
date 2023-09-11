import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import { fetchSettingByKey, updateSetting } from '@root/state/modules/settings';
import DriverAppForm from '@root/scenes/Admin/components/DriverAppForm';

// export type Props = {
//   fetchSettingByKey: string => void,
//   updateSetting: (Array<Object>) => void,
//   setting: Object,
// };

export class DriverAppConfig extends PureComponent {
  componentDidMount() {
    this.props.fetchSettingByKey('driver.dispatcherPhone');
  }

  handleUpdateSetting = (values) => {
    const data = [
      {
        key: 'driver.dispatcherPhone',
        value: values.phone,
        businessUnitId: values.businessUnitId,
      },
    ];
    this.props.updateSetting(data);
  };

  render() {
    const { setting } = this.props;
    return (
      <AdminView title="Driver Settings">
        {setting.updateStatus === 'DONE' ? <div className="alert alert-success" role="alert">
            Driver settings changed!
          </div> : null}
        <Helmet title="Driver Settings" />
        <DriverAppForm onUpdateSetting={this.handleUpdateSetting} phone={setting.driver} />
      </AdminView>
    );
  }
}

DriverAppConfig.propTypes = {
  updateSetting: PropTypes.func.isRequired,
  setting: PropTypes.object.isRequired,
  fetchSettingByKey: PropTypes.func.isRequired,
};

const mapStateToProps = ({ setting }) => ({ setting });
const mapDispatchToProps = (dispatch) => ({
  fetchSettingByKey: (key) => dispatch(fetchSettingByKey(key)),
  updateSetting: (data) => dispatch(updateSetting(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DriverAppConfig);
